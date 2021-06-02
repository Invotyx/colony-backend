import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bull';
import { env } from 'process';
import Stripe from 'stripe';
import { ContactsService } from '../contacts/contacts.service';
import { PaymentHistoryService } from '../payment-history/payment-history.service';
import { PhoneService } from '../phone/phone.service';
import { PaymentMethodsService } from '../products/payments/payment-methods.service';
import { PlansService } from '../products/plan/plans.service';
import { SubscriptionsService } from '../products/subscription/subscriptions.service';
import { BroadcastService } from '../sms/broadcast.service';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);
  private stripe: Stripe;
  private client;
  constructor(
    private readonly contactService: ContactsService,
    private readonly smsService: SmsService,
    private readonly paymentHistoryService: PaymentHistoryService,
    private readonly planService: PlansService,
    private readonly subscriptionService: SubscriptionsService,
    private readonly paymentService: PaymentMethodsService,
    private readonly phoneService: PhoneService,
    private readonly broadcastService: BroadcastService,
    @InjectQueue('broadcast_q') private readonly queue: Queue,
  ) {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2020-08-27',
    });

    this.client = require('twilio')(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
      {
        lazyLoading: true,
      },
    );
  }

  @Cron('10 * * * * *')
  async checkForBroadcasts() {
    //get all broadcasts where broadcast schedule is less than 1
    // get contact list for each broadcast

    const broadcasts = await (await this.broadcastService.qb('bcq'))
      .where(
        `
        (DATE_PART('day', bcq.scheduled::timestamp - '${this.getCurrentDate()}'::timestamp) * 24 + 
         DATE_PART('hour', bcq.scheduled::timestamp - '${this.getCurrentDate()}'::timestamp) * 60 +
         DATE_PART('minute', bcq.scheduled::timestamp - '${this.getCurrentDate()}'::timestamp) * 60 +
         DATE_PART('second', bcq.scheduled::timestamp - '${this.getCurrentDate()}'::timestamp))=0`,
      )
      .getMany();

    console.log('task-broadcasts', broadcasts);

    for (let broadcast of broadcasts) {
      const contacts = await this.contactService.filterContacts(
        broadcast.user.id,
        JSON.parse(broadcast.filters),
      );
      //add to queue here.
    }
    // await this.queue.add('inboundSms', body, {
    //   removeOnComplete: true,
    //   removeOnFail: true,
    //   attempts: 2,
    // });
  }

  //cron to check for due payments.
  @Cron('10 * * * * *')
  async checkForPackageExpiryAndResubscribe() {
    try {
      const subscriptions = await (await this.subscriptionService.qb('sub'))
        .where(
          `(CAST(sub.currentEndDate AS date) - CAST('${this.getCurrentDate()}' AS date))<=1`,
        )
        .getMany();
      for (let subscription of subscriptions) {
        const requests = await Promise.all([
          this.planService.findOne({ where: { id: subscription.plan } }),
          this.paymentService.findOne({
            where: { default: true, user: subscription.user },
          }),
        ]);
        const plan = requests[0];
        const default_pm = requests[1];

        if (default_pm) {
          // charge client here
          const charge = await this.stripe.paymentIntents.create({
            amount: Math.round(plan.amount_decimal * 100),
            currency: 'GBP',
            capture_method: 'automatic',
            confirm: true,
            confirmation_method: 'automatic',
            customer: subscription.user.customerId,
            description: 'Plan resubscribed!',
            payment_method: default_pm.id,
          });
          if (charge.status == 'succeeded') {
            subscription.currentStartDate = new Date();
            subscription.currentEndDate = new Date(
              new Date().setDate(new Date().getDate() + 30),
            );

            await this.subscriptionService.save(subscription);

            await this.paymentHistoryService.addRecordToHistory({
              user: subscription.user,
              description: 'Base Package Re-subscribed.',
              cost: plan.amount_decimal,
              costType: 'base-plan-purchase',
              chargeId: charge.id,
            });
          } else {
            this.logger.debug('payment charge failed with details:');
            this.logger.debug(charge);
          }
        }
        this.logger.debug(subscriptions);
      }
    } catch (e) {
      this.logger.debug(e);
    }
  }

  // check if user has not completed profile yet.
  @Cron('0 0 16 * * *')
  async checkIfContactHasCompletedProfile() {
    const contacts = await this.contactService.find({
      where: { isComplete: false },
      relations: ['user'],
    });

    let influencer;

    for (let contact of contacts) {
      influencer = contact.user;

      const noResponseMessage = this.search(
        'noResponse',
        await this.smsService.getPresetMessage(influencer),
      );

      const threshold = 1;
      const remindersFlag = true;

      if (remindersFlag) {
        if (this.dateDifference(new Date(), contact.createdAt) <= threshold) {
          await this.smsService.sendSms(
            contact,
            influencer,
            noResponseMessage.body,
            'outBound',
          );
        }
      }
    }
  }

  //#region Utility Functions
  private getCurrentDate() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();
    return mm + '/' + dd + '/' + yyyy;
  }

  private search(nameKey, myArray) {
    for (var i = 0; i < myArray.length; i++) {
      if (myArray[i].trigger === nameKey) {
        return myArray[i];
      }
    }
  }

  private dateDifference(start, end) {
    let firstDate = new Date(start),
      secondDate = new Date(end),
      timeDifference = Math.abs(secondDate.getTime() - firstDate.getTime());

    let differenceInDays = Math.ceil(timeDifference / (1000 * 3600 * 24));
    return differenceInDays;
  }

  //#endregion
}
