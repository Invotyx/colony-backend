import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { env } from 'process';
import Stripe from 'stripe';
import { nanoid } from '../../../shared/random-keygen';
import { PaymentHistoryService } from '../../payment-history/payment-history.service';
import { PhoneService } from '../../phone/phone.service';
import { UserEntity } from '../../users/entities/user.entity';
import { UsersService } from '../../users/services/users.service';
import { PaymentMethodsService } from '../payments/payment-methods.service';
import { PlansEntity } from '../plan/plans.entity';
import { PlansService } from '../plan/plans.service';
import { collection_method, SubscriptionsDto } from './subscriptions.dto';
import { SubscriptionsEntity } from './subscriptions.entity';
import { SubscriptionsRepository } from './subscriptions.repo';

@Injectable()
export class SubscriptionsService {
  private stripe: Stripe;
  constructor(
    private readonly repository: SubscriptionsRepository,
    public readonly planService: PlansService,
    private readonly paymentService: PaymentMethodsService,
    private readonly userService: UsersService,
    @Inject(forwardRef(() => PhoneService))
    private readonly phoneService: PhoneService,
    private readonly paymentHistory: PaymentHistoryService,
  ) {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2020-08-27',
    });
  }

  public async findOne(condition?: any) {
    if (condition) return await this.repository.findOne(condition);
    else return await this.repository.findOne();
  }

  public async find(condition?: any) {
    if (condition) return await this.repository.find(condition);
    else return await this.repository.find();
  }

  public async save(obj: SubscriptionsEntity) {
    return await this.repository.save(obj);
  }

  public async qb(alias: string) {
    return this.repository.createQueryBuilder(alias);
  }

  public async createSubscription(customer: UserEntity, sub: SubscriptionsDto) {
    try {
      const _plan = await this.planService.findOne({
        where: { id: sub.planId },
      });
      if (_plan) {
        const phone = await this.phoneService.findOne({
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
      const customer_payments = await this.paymentService.findOne({
        where: { user: customer, default: true },
      });
      if (customer_payments) {
        const checkNumber = await this.phoneService.findOne({
          number: sub.number,
          status: 'active',
        });
        if (checkNumber) {
          throw new BadRequestException(
            'Phone number is not available for purchase.',
          );
        }

        // charge client here
        const charge = await this.stripe.paymentIntents.create({
          amount: Math.round(_plan.amount_decimal * 100),
          currency: 'GBP',
          capture_method: 'automatic',
          confirm: true,
          confirmation_method: 'automatic',
          customer: customer.customerId,
          description: 'Base Package subscription charge!',
          payment_method: customer_payments.id,
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
            description: 'Base Plan purchased',
            cost: _plan.amount_decimal,
            costType: 'base-plan-purchase',
            chargeId: charge.id,
          });
          if (purchasedNumber.number != null) {
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
              phone: purchasedNumber.number,
            });

            const influencer = await this.userService.findOne({
              where: { id: customer.id },
            });
            influencer.isActive = true;
            influencer.isApproved = true;

            await this.userService.save(influencer);

            return {
              message:
                'Subscribed to selected plan successfully.' +
                purchasedNumber.message,
              number: purchasedNumber.number,
            };
          } else {
            return {
              message: purchasedNumber.message,
              number: purchasedNumber.number,
            };
          }
        } else {
          //fail if unsuccessful.
          throw new BadRequestException(
            'Payment against your default card is failed. Details: ' +
              charge.cancellation_reason +
              charge.canceled_at,
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
          let plans = await this.planService.find({
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
