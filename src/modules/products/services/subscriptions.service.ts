import { BadRequestException, Injectable } from '@nestjs/common';
import { env } from 'process';
import { PlansEntity } from 'src/entities/plans.entity';
import { SubscriptionsEntity } from 'src/entities/subscriptions.entity';
import { UserEntity } from 'src/entities/user.entity';
import { PhoneService } from 'src/modules/phone/phone.service';
import { UsersService } from 'src/modules/users/services/users.service';
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
  ) {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2020-08-27',
    });
  }

  public async createSubscription(customer: UserEntity, sub: SubscriptionsDto) {
    try {
      // Check for existing subscriptions
      // Allow one bundled subscription
      // Allow multiple phone only subscriptions
      /* const check = await this.repository
        .createQueryBuilder('s')
        .leftJoinAndSelect(TABLES.PLANS.name, 'p', 's.planId = p.id')
        .where('p.planType = :planType', { planType: 'bundle' })
        .andWhere('s.userId=:userId', { userId: customer.id })
        .getCount();

      console.log(check); */
      const _plan = await this.planService.repository.findOne({
        where: { id: sub.planId },
      });
      const phone = await this.phoneService.repo.findOne({ where: { number: sub.number } });
      if (phone) {
        const checkPhoneLinkWithActiveSubscription = await this.repository.findOne({ where: { phone:phone, cancelled: false } });
        if (checkPhoneLinkWithActiveSubscription) {
          throw new BadRequestException('This phone number is not available for purchase.');
        }
      }
      return await this.createSubscriptionInStripe(customer, sub, _plan);
      /* 
      if (check == 0) {
        return await this.createSubscriptionInStripe(customer, sub, _plan);
      }
      if (check > 0 && _plan.planType !== 'bundle') {
        return await this.createSubscriptionInStripe(customer, sub, _plan);
      } else {
        throw new BadRequestException(
          'You can only have one BUNDLE subscription.',
        );
      } */
    } catch (e) {
      throw e;
    }
  }

  private async createSubscriptionInStripe(
    customer: UserEntity,
    sub: SubscriptionsDto,
    _plan: PlansEntity,
  ) {
    try {
      let subscription: any;
      let current_period_end: any = null;
      let current_period_start: any = null;
      let subOrIntent: any = null;
      const customer_payments = await this.paymentService.repository.findOne({
        where: { user: customer, default: true },
      });
      if (customer_payments) {
        const checkNumber = await this.phoneService.repo.findOne({ number: sub.number, status: 'active' });
        if (checkNumber) {
          throw new BadRequestException('Phone number is not available for purchase.')
        }
        subscription = await this.stripe.subscriptions.create({
          customer: customer.customerId,
          items: [
            {
              plan: sub.planId,
              quantity: 1,
            },
          ],
          collection_method:
            sub.collectionMethod.toString() == 'charge_automatically'
              ? 'charge_automatically'
              : 'send_invoice',
        });
        current_period_end = this.timestampToDate(
          subscription.current_period_end,
        );
        current_period_start = this.timestampToDate(
          subscription.current_period_start,
        );

        subOrIntent = subscription.items.data[0].id;

        const purchasedNumber = await this.phoneService.purchasePhoneNumber(
          _plan.country.code.toUpperCase(),
          sub.number,
          customer,
        );
        const purchasedNumberDb = await this.phoneService.repo.findOne({
          where: { number: purchasedNumber.number.number },
        });
        await this.repository.save({
          stripeId: subscription.id,
          plan: _plan,
          user: customer,
          cancelled: false,
          collection_method: sub.collectionMethod,
          paymentType: _plan.recurring,
          stripeSubscriptionItem: subOrIntent,
          currentStartDate: current_period_start,
          currentEndDate: current_period_end,
          smsCount: _plan.smsCount,
          number: purchasedNumberDb,
          country: _plan.country
        });

        return {
          message: 'Subscribed to selected plan successfully.' + purchasedNumber.message,
          number: purchasedNumber.number,
        };
      } else {
        throw new BadRequestException('Please add payment method first.');
      }
    } catch (e) {
      throw e;
    }
  }

  public async getSubscriptions(customer: UserEntity) {
    try {
      const ch =  await this.repository.query(`SELECT sub.*,  phones."number", "country"."name" FROM "subscriptions" "sub" LEFT JOIN "plans" "plans" ON "plans"."id"="sub"."planId" 
      LEFT JOIN "country" "country" ON "country"."id"="sub"."countryId"  LEFT JOIN "phones" "phones" ON "phones"."id"="sub"."phoneId" WHERE ( "sub"."userId" =${customer.id}  ) AND ( "sub"."deletedAt" IS NULL )`);
      //console.log(ch);

      if (ch) {
        return  ch ;
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
        where: { stripeId: subId, cancelled: true },
      });
      console.log(sub,"=== sub ===")
      if (!sub) {
        const checkSub = await this.repository.findOne({
          where: { stripeId: subId, cancelled: false },relations:['plan','country','phone']
        });
        if (checkSub) {

          let plans = await this.planService.repository.find({ where: { country: checkSub.country } });
          if (plans.length>0) {
            const _toBeSelectedPlan = plans.find(p => { return p.id === planId });
            const _existing = checkSub.plan; 
            let checkMonthsUsage = this.daysBetween(checkSub.createdAt, new Date());
            if (_toBeSelectedPlan.amount_decimal < _existing.amount_decimal && checkMonthsUsage >= 90) {
              throw new BadRequestException('You have been using this plan for 3 months now and you are only allowed to upgrade subscription for this number.');
            } else {
              const canceledInStripe = await this.stripe.subscriptions.del(subId);
              const current_period_end = this.timestampToDate(
                canceledInStripe.current_period_end,
              );
              const current_period_start = this.timestampToDate(
                canceledInStripe.current_period_start,
              );
              checkSub.cancelled = true;
              checkSub.currentStartDate = current_period_start;
              checkSub.currentEndDate = current_period_end;
              await this.repository.save(checkSub);
              
              const newStripeSubscription = await this.stripe.subscriptions.create({
                customer: customer.customerId,
                items: [
                  {
                    plan: _toBeSelectedPlan.id,
                    quantity: 1,
                  },
                ],
                collection_method: 'charge_automatically'
              });

              const newSub = new SubscriptionsEntity();
              newSub.user = customer;
              newSub.cancelled = false;
              newSub.plan = _toBeSelectedPlan;
              newSub.stripeId = newStripeSubscription.id;
              newSub.stripeSubscriptionItem = newStripeSubscription.items.data[0].id;
              newSub.collection_method = collection_method.charge_automatically;
              newSub.paymentType = 'recurring';
              newSub.currentStartDate = this.timestampToDate(newStripeSubscription.current_period_start);
              newSub.currentEndDate = this.timestampToDate(newStripeSubscription.current_period_end);
              newSub.phone = checkSub.phone;
              newSub.smsCount = _toBeSelectedPlan.smsCount;
              newSub.country = checkSub.country;
              await this.repository.save(newSub);

              return { message: 'Subscription updated successfully.' };
            }
          } else {
            throw new BadRequestException('No plans found. Contact System admin.')   
          }
        } else {
          throw new BadRequestException(
            'No such subscription exists.',
          );
        }
      }else {
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
      if (sub && sub.stripeSubscriptionItem.includes('si_')) {
        sub.cancelled = true;
        await this.repository.save(sub);
        await this.stripe.subscriptions.del(sub.stripeId);
        return { message: 'Unsubscribed successfully.' };
      } else {
        throw new BadRequestException('One time payments cannot be canceled.');
      }
    } catch (e) {
      throw e;
    }
  }

  private timestampToDate(timestamp: number) {
    const milliseconds = timestamp * 1000;
    return new Date(milliseconds);
  }


  private daysBetween(startDate, endDate) {
    const mpd = 24 * 60 * 60 * 1000;
    return Math.round((endDate-startDate)/mpd);
  }
}
