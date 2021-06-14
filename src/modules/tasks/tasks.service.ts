import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Queue } from 'bull';
import { env } from 'process';
import { tagReplace } from 'src/shared/tag-replace';
import Stripe from 'stripe';
import { LessThanOrEqual } from 'typeorm';
import { ContactsService } from '../contacts/contacts.service';
import { InfluencerLinksService } from '../influencer-links/influencer-links.service';
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
    private readonly infLinks: InfluencerLinksService,
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

    await this.broadcastService.find();
    const broadcasts = await this.broadcastService.find({
      where: {
        scheduled: LessThanOrEqual(this.getCurrentDatetime()),
        status: 'scheduled',
      },
      relations: ['user'],
    });

    for (let broadcast of broadcasts) {
      const contacts = await this.contactService.filterContacts(
        broadcast.user.id,
        JSON.parse(broadcast.filters),
      );
      broadcast.status = 'inProgress';

      await this.broadcastService.save(broadcast);
      for (let contact of contacts.contacts) {
        const phone = await this.phoneService.findOne({
          where: { country: contact.cCode, user: broadcast.user },
        });
        if (phone) {
          let messageBody = broadcast.body;
          const links = messageBody.match(/\$\{link:[1-9]*[0-9]*\d\}/gm);
          if (links.length > 0) {
            for (let link of links) {
              let id = link.replace('${link:', '').replace('}', '');
              const shareableUri = (
                await this.infLinks.getUniqueLinkForContact(
                  parseInt(id),
                  contact.phoneNumber,
                )
              ).url;
              messageBody = messageBody.replace(
                link,
                env.API_URL + '/api/s/o/' + shareableUri,
              );
              await this.infLinks.sendLink(shareableUri);
            }
          }
          const q_obj = {
            message: tagReplace(messageBody, {
              name: contact.name ? contact.name : '',
              inf_name:
                broadcast.user.firstName + ' ' + broadcast.user.lastName,
            }),
            contact: contact,
            phone: phone,
          };

          await this.queue.add('broadcast_message', q_obj, {
            removeOnComplete: true,
            removeOnFail: true,
            attempts: 2,
          });
        } else {
          //operation if phone number for contact country cannot be found.
        }
      }
    }
    //
  }

  //cron to check for due payments.
  @Cron('0 59 11 * * *')
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
          this.phoneService.getUserPurchasedActiveNumbers(subscription.user),
          this.paymentHistoryService.getDues('contacts', subscription.user),
        ]);
        const plan = requests[0];
        const default_pm = requests[1];
        const phones = requests[2];
        const fans = requests[3];

        let phonesCost = 0;

        for (let phone of phones) {
          phonesCost += parseInt(phone.phonecost);
        }

        if (default_pm) {
          // charge client here
          const charge = await this.stripe.paymentIntents.create({
            amount: Math.round(
              (plan.amount_decimal + phonesCost + fans.cost) * 100,
            ),
            currency: 'GBP',
            capture_method: 'automatic',
            confirm: true,
            confirmation_method: 'automatic',
            customer: subscription.user.customerId,
            description:
              'Plan resubscribed, with phone numbers and fans due charges.',
            payment_method: default_pm.id,
          });
          if (charge.status == 'succeeded') {
            const renewal = new Date().setDate(new Date().getDate() + 30);
            subscription.currentStartDate = new Date();
            subscription.currentEndDate = new Date(renewal);

            for (let phone of phones) {
              await this.phoneService.changeRenewal(
                subscription.user,
                phone.number,
                new Date(renewal),
              );
            }

            await this.paymentHistoryService.setDuesToZero({
              type: 'contacts',
              user: subscription.user,
            });

            await this.subscriptionService.save(subscription);

            await this.paymentHistoryService.addRecordToHistory({
              user: subscription.user,
              description:
                'Base Package Re-subscribed with phone numbers and fans due charges.',
              cost: plan.amount_decimal,
              costType: 'base-plan-purchase',
              chargeId: charge.id,
            });
            //send email here
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

  //cron to check for due payments.
  @Cron('0 59 11 * * *')
  async checkForSmsThreshold() {
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
          this.paymentHistoryService.getDues('sms', subscription.user),
        ]);
        const plan = requests[0];
        const default_pm = requests[1];
        const sms = requests[2];

        if (default_pm && sms.cost < plan.threshold) {
          // charge client here
          const charge = await this.stripe.paymentIntents.create({
            amount: Math.round(sms.cost * 100),
            currency: 'GBP',
            capture_method: 'automatic',
            confirm: true,
            confirmation_method: 'automatic',
            customer: subscription.user.customerId,
            description: 'Sms Dues payed automatically on reaching threshold.',
            payment_method: default_pm.id,
          });
          if (charge.status == 'succeeded') {
            await this.paymentHistoryService.setDuesToZero({
              type: 'sms',
              user: subscription.user,
            });

            await this.paymentHistoryService.addRecordToHistory({
              user: subscription.user,
              description:
                'Sms Dues payed automatically on reaching threshold.',
              cost: sms.cost,
              costType: 'sms-dues',
              chargeId: charge.id,
            });
            //send email here
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

  private getCurrentDatetime() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();

    const hh = today.getHours().toString().padStart(2, '0');
    const MM = today.getMinutes().toString().padStart(2, '0');
    const ss = today.getSeconds().toString().padStart(2, '0');

    return mm + '/' + dd + '/' + yyyy + ' ' + hh + ':' + MM + ':' + ss;
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
