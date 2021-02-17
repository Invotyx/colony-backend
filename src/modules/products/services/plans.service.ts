import { Injectable } from '@nestjs/common';
import { PlansDto } from '../dto/plans.dto';
import { PlansRepository } from '../repos/plans.repo';
import { interval } from '../dto/plans.dto';
import Stripe from 'stripe';
import { env } from 'process';

@Injectable()
export class PlansService {
  private stripe: Stripe;
  constructor(public readonly repository: PlansRepository) {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2020-08-27',
    });
  }

  async createPlanInStripe(plan: PlansDto, productId: string): Promise<any> {
    try {
      const newPlan = await this.stripe.plans.create({
        amount_decimal: (plan.amount_decimal * 100).toString(),
        product: productId,
        currency: plan.currency,
        interval: plan.interval.toString() === 'month' ? 'month' : 'year',
        active: true,
        nickname: plan.nickname,
      });

      plan.id = newPlan.id;
      plan.product = productId as any;
      plan.active = true;
      plan.interval =
        plan.interval.toString() === 'month' ? interval.month : interval.year;
      const dbPlan = await this.repository.save(plan);

      return { plan: dbPlan };
    } catch (e) {
      throw e;
    }
  }

  async createPriceInStripe(plan: PlansDto, productId: string): Promise<any> {
    try {
      const newPlan = await this.stripe.prices.create({
        product: productId,
        unit_amount_decimal: (plan.amount_decimal * 100).toString(),
        currency: plan.currency,
        active: true,
        nickname: plan.nickname,
      });

      plan.id = newPlan.id;
      plan.product = productId as any;
      plan.active = true;
      const dbPlan = await this.repository.save(plan);

      return { plan: dbPlan };
    } catch (e) {
      throw e;
    }
  }

  async activateDeactivatePlan(
    planId: string,
    isActive: boolean,
  ): Promise<any> {
    try {
      console.log(isActive);

      await this.stripe.plans.update(planId, {
        active: isActive,
      });

      const _p = await this.repository.findOne({ where: { id: planId } });
      if (_p) {
        _p.active = true;
      }
      const _plan = await this.repository.save(_p);
      return { plan: _plan };
    } catch (e) {
      throw e;
    }
  }

  async deletePlan(planId: string): Promise<any> {
    try {
      await this.stripe.plans.del(planId);

      const _plan = await this.repository.delete(planId);
      return { plan: _plan };
    } catch (e) {
      throw e;
    }
  }
}
