import { BadRequestException, Injectable } from '@nestjs/common';
import { env } from 'process';
import { PlansEntity } from 'src/entities/plans.entity';
import { SubscriptionsEntity } from 'src/entities/subscriptions.entity';
import { UserEntity } from 'src/entities/user.entity';
import { PaymentHistoryService } from 'src/modules/payment-history/payment-history.service';
import { PhoneService } from 'src/modules/phone/phone.service';
import { UsersService } from 'src/modules/users/services/users.service';
import { nanoid } from 'src/shared/random-keygen';
import Stripe from 'stripe';
import { collection_method, SubscriptionsDto } from '../dto/subscriptions.dto';
import { SubscriptionsRepository } from '../repos/subscriptions.repo';
import { PaymentMethodsService } from './payment-methods.service';
import { PlansService } from './plans.service';

@Injectable()
export class SubscriptionsService {
  private stripe: Stripe;
  constructor(
    public readonly repository: SubscriptionsRepository,
    public readonly planService: PlansService,
    public readonly paymentService: PaymentMethodsService,
    public readonly userService: UsersService,
    public readonly phoneService: PhoneService,
    public readonly paymentHistory: PaymentHistoryService,
  ) {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2020-08-27',
    });
  }

  public async createSubscription(customer: UserEntity, sub: SubscriptionsDto) {
    try {
      const _plan = await this.planService.repository.findOne({
        where: { id: sub.planId },
      });
      if (_plan) {
        const phone = await this.phoneService.repo.findOne({
          where: { number: sub.number },
        });
        if (phone) {
          const checkPhoneLinkWithActiveSubscription = await this.repository.findOne(
            { where: { phone: phone, cancelled: false } },
          );
          if (checkPhoneLinkWithActiveSubscription) {
            throw new BadRequestException(
              'This phone number is not available for purchase.',
            );
          }
        }
        return await this.createSubscriptionInDb(customer, sub, _plan);
      } else {
        throw new BadRequestException('Plan does not exist.');
      }
    } catch (e) {
      throw e;
    }
  }

  private async createSubscriptionInDb(
    customer: UserEntity,
    sub: SubscriptionsDto,
    _plan: PlansEntity,
  ) {
    try {
      const customer_payments = await this.paymentService.repository.findOne({
        where: { user: customer, default: true },
      });
      if (customer_payments) {
        const checkNumber = await this.phoneService.repo.findOne({
          number: sub.number,
          status: 'active',
        });
        if (checkNumber) {
          throw new BadRequestException(
            'Phone number is not available for purchase.',
          );
        }

        // charge client here
        const charge = await this.stripe.charges.create({
          amount: _plan.amount_decimal * 100,
          capture: true,
          currency: 'GBP',
          source: customer_payments.id,
          customer: customer.customerId,
          description: 'Base Package subscription charge!',
        });

        if (charge.status == 'succeeded') {
          // add charge details to history

          const purchasedNumber = await this.phoneService.purchasePhoneNumber(
            sub.country.toUpperCase(),
            sub.number,
            customer,
            'sub',
          );

          await this.paymentHistory.addRecordToHistory({
            user: customer,
            description:
              'Base Plan purchased with number: ' +
              purchasedNumber.number.number,
            cost: _plan.amount_decimal,
            costType: 'base-plan-purchase',
            chargeId: charge.id,
          });

          const purchasedNumberDb = await this.phoneService.repo.findOne({
            where: { number: purchasedNumber.number.number },
          });

          await this.repository.save({
            rId: nanoid(),
            plan: _plan,
            user: customer,
            cancelled: false,
            collection_method: sub.collectionMethod,
            paymentType: 'recurring',
            currentStartDate: new Date(),
            currentEndDate: new Date(
              new Date().setDate(new Date().getDate() + 30),
            ),
            phone: purchasedNumberDb,
          });

          return {
            message:
              'Subscribed to selected plan successfully.' +
              purchasedNumber.message,
            number: purchasedNumber.number,
          };
        } else {
          //fail if unsuccessful.
          throw new BadRequestException(
            'Payment against your default card is failed. Details: ' +
              charge.failure_code +
              charge.failure_message,
          );
        }
      } else {
        throw new BadRequestException('Please add payment method first.');
      }
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  public async getSubscriptions(customer: UserEntity) {
    try {
      const ch = await this.repository
        .query(`SELECT sub.*,  phones."number","plans"."amount_decimal" as "price", "plans"."subscriberCost", "plans"."threshold" ,"plans"."nickname" as "planName", "country"."name" as "countryName"  FROM "subscriptions" "sub" LEFT JOIN "plans" "plans" ON "plans"."id"="sub"."planId" 
      LEFT JOIN "country" "country" ON "country"."id"="sub"."countryId"  LEFT JOIN "phones" "phones" ON "phones"."id"="sub"."phoneId" WHERE ( "sub"."userId" =${customer.id}  ) AND ( "sub"."deletedAt" IS NULL )`);
      //console.log(ch);

      if (ch) {
        return ch;
      }
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  //YET TO IMPLEMENT
  public async updateSubscription(
    customer: UserEntity,
    subId: string,
    planId: string,
  ) {
    try {
      const sub = await this.repository.findOne({
        where: { rId: subId, cancelled: true },
      });
      console.log(sub, '=== sub ===');
      if (!sub) {
        const checkSub = await this.repository.findOne({
          where: { rId: subId, cancelled: false },
          relations: ['plan', 'country', 'phone'],
        });
        if (checkSub) {
          let plans = await this.planService.repository.find({
            where: { country: checkSub.country },
          });
          if (plans.length > 0) {
            const _toBeSelectedPlan = plans.find((p) => {
              return p.id === planId;
            });

            checkSub.cancelled = true;
            checkSub.currentEndDate = new Date();
            await this.repository.save(checkSub);

            const newSub = new SubscriptionsEntity();
            newSub.user = customer;
            newSub.cancelled = false;
            newSub.plan = _toBeSelectedPlan;
            newSub.rId = nanoid();
            newSub.collection_method = collection_method.charge_automatically;
            newSub.paymentType = 'recurring';
            newSub.currentStartDate = new Date();
            newSub.currentEndDate = new Date(
              new Date().setDate(new Date().getDate() + 30),
            );
            newSub.phone = checkSub.phone;
            newSub.country = checkSub.country;
            await this.repository.save(newSub);

            return { message: 'Subscription updated successfully.' };
          }
        }
      } else {
        throw new BadRequestException(
          'You cannot upgrade or downgrade already cancelled subscription',
        );
      }
    } catch (e) {
      throw e;
    }
  }

  //yet to implement
  public async cancelSubscription(subId: string) {
    const sub = await this.repository.findOne({
      where: { stripeId: subId, cancelled: false },
    });
    try {
      sub.cancelled = true;
      await this.repository.save(sub);
      return { message: 'Unsubscribed successfully.' };
    } catch (e) {
      throw e;
    }
  }
}
