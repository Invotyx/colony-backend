import { Injectable } from '@nestjs/common';
import { env } from 'process';
import { UserEntity } from 'src/entities/user.entity';
import Stripe from 'stripe';
import { SubscriptionsDto } from '../dto/subscriptions.dto';
import { SubscriptionsRepository } from '../repos/subscriptions.repo';
import { PlansService } from './plans.service';

@Injectable()
export class SubscriptionsService {
  private stripe: Stripe;
  constructor(
    public readonly repository: SubscriptionsRepository,
    public readonly planService: PlansService,
  ) {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2020-08-27',
    });
  }

  public async createSubscription(customer: UserEntity, sub: SubscriptionsDto) {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customer.customerId,
        items: [
          {
            plan: sub.planId,
            quantity: 1,
          },
        ],
        collection_method:
          sub.collection_method.toString() == 'charge_automatically'
            ? 'charge_automatically'
            : 'send_invoice',
      });

      const _dbSub = await this.repository.save({
        id: subscription.id,
        plan: await this.planService.repository.findOne({
          where: { id: sub.planId },
        }),
        user: customer,
        cancelled: false,
        collection_method: sub.collection_method,
      });

      return { subscription: _dbSub };
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
}
