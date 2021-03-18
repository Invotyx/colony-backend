import { BadRequestException, Injectable } from '@nestjs/common';
import { env } from 'process';
import { TABLES } from 'src/consts/tables.const';
import { PlansEntity } from 'src/entities/plans.entity';
import { SubscriptionsEntity } from 'src/entities/subscriptions.entity';
import { UserEntity } from 'src/entities/user.entity';
import { UsersService } from 'src/modules/users/services/users.service';
import Stripe from 'stripe';
import { planType } from '../dto/plans.dto';
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
      const check = await this.repository
        .createQueryBuilder('s')
        .leftJoinAndSelect(TABLES.PLANS.name, 'p', 's.planId = p.id')
        .where('p.planType = :planType', { planType: 'bundle' })
        .getCount();
      const _plan = await this.planService.repository.findOne({
        where: { id: sub.planId },
      });

      if (check == 0) {
        return await this.createSubscriptionInStripe(customer, sub, _plan);
      } else if (check > 0 && _plan.planType != planType.bundle) {
        console.log("here false")
        return await this.createSubscriptionInStripe(customer, sub, _plan);
      } else {
        throw new BadRequestException('You can only have one BUNDLE subscription.');
      }
    } catch (e) {
      throw e;
    }
  }

  private async createSubscriptionInStripe(
    customer: UserEntity,
    sub: SubscriptionsDto,
    _plan: PlansEntity,
  ) {
    let subscription: any;
    let current_period_end: any = null;
    let current_period_start: any = null;
    let subOrIntent: any = null;
    if (sub.planId.includes('price_')) {
      const customer_payments: any = await this.paymentService.repository
        .createQueryBuilder('pm')
        .leftJoin(TABLES.USERS.name, 'u', 'pm.userId = u.id')
        .orderBy('pm.createdAt', 'DESC')
        .getOne();

      if (customer_payments) {
        subscription = await this.stripe.paymentIntents.create({
          amount: _plan.amount_decimal * 100,
          currency: _plan.currency,
          capture_method: 'automatic',
          confirm: true,
          customer: customer.customerId,
          payment_method: customer_payments.id,
        });

        subOrIntent = subscription.id;
      } else {
        return { message: 'Please add payment method first.' };
      }
    } else {
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
    }

    try {
      const res = await this.repository.save({
        stripeId: subscription.id,
        plan: _plan,
        user: customer,
        cancelled: false,
        collection_method: sub.collectionMethod,
        paymentType: _plan.recurring,
        stripeSubscriptionItem: subOrIntent,
        currentStartDate: current_period_start,
        currentEndDate: current_period_end,
      });
      customer.purchasedPhoneNumberCredits =
        customer.purchasedPhoneNumberCredits + _plan.phoneCount;
      customer.purchasedSmsCount = customer.purchasedSmsCount + _plan.smsCount;
      await this.userService.repository.save(customer);
      return { message: 'Subscribed to selected plan successfully.' };
    } catch (e) {
      throw e;
    }
  }

  public async getSubscriptions(customer: UserEntity) {
    try {
      const subscription = await this.repository.find({
        where: { user: customer.id },
      });
      if (subscription) {
        return subscription;
      } else {
        return 'No records found';
      }
    } catch (e) {
      throw e;
    }
  }

  public async updateSubscription(
    customer: UserEntity,
    subId: string,
    planId: string,
  ) {
    try {
      const sub = await this.repository.findOne({
        where: { stripeId: subId, cancelled: false },
      });
      if (sub.paymentType != 'recurring') {
        return { message: 'You cannot update one time payment subscriptions.' };
      }
      if (planId.includes('price_')) {
        return { message: 'You cannot add one time pricing to subscription.' };
      }
      if (sub.plan.id == planId && sub.cancelled == false) {
        const _upSub = await this.stripe.subscriptions.update(subId, {
          items: [
            {
              id: sub.stripeSubscriptionItem,
              plan: planId,
            },
          ],
          collection_method: 'charge_automatically',
        });

        if (_upSub) {
          const current_period_end = this.timestampToDate(
            _upSub.current_period_end,
          );
          const current_period_start = this.timestampToDate(
            _upSub.current_period_start,
          );
          const _p = await this.planService.repository.findOne({
            where: { id: planId },
          });
          sub.cancelled = true;
          await this.repository.save(sub);
          const newSub = new SubscriptionsEntity();
          newSub.user = customer;
          newSub.cancelled = false;
          newSub.plan = _p;
          newSub.stripeId = _upSub.items.data[0].subscription;
          newSub.stripeSubscriptionItem = _upSub.items.data[0].id;
          newSub.collection_method = collection_method.charge_automatically;
          newSub.paymentType = 'recurring';
          newSub.currentStartDate = current_period_start;
          newSub.currentEndDate = current_period_end;
          await this.repository.save(newSub);
          return { message: 'Subscription updated successfully.' };
        } else {
          throw new BadRequestException(
            'Unable to change subscription right now, try again later',
          );
        }
      } else {
        return {
          message:
            'You are already subscribed to same plan. You cannot subscribe to same plan unless you unsubscribe it first.',
        };
      }
    } catch (e) {
      throw e;
    }
  }

  public async cancelSubscription(subId: string) {
    const sub = await this.repository.findOne({
      where: { stripeId: subId, cancelled: false },
    });
    try {
      if (sub) {
        sub.cancelled = true;
        await this.repository.save(sub);
        await this.stripe.subscriptions.del(sub.stripeId);
        return { message: 'Unsubscribed successfully.' };
      }
    } catch (e) {
      throw e;
    }
  }

  private timestampToDate(timestamp: number) {
    const milliseconds = timestamp * 1000;
    return new Date(milliseconds);
  }
}
