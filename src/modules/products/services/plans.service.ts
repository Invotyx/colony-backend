import { BadRequestException, Injectable } from '@nestjs/common';
import { env } from 'process';
import { nanoid } from 'src/shared/random-keygen';
import Stripe from 'stripe';
import { interval, PlansDto } from '../dto/plans.dto';
import { PlansRepository } from '../repos/plans.repo';

@Injectable()
export class PlansService {
  private stripe: Stripe;
  constructor(public readonly repository: PlansRepository) {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2020-08-27',
    });
  }

  async createPlanInDb(plan: PlansDto): Promise<any> {
    try {
      plan.id = nanoid();
      plan.active = true;

      (plan.interval =
        plan.interval.toString() === 'month' || plan.interval.toString() === ''
          ? interval.month
          : interval.year),
        (plan.currency =
          plan.currency != '' ? plan.currency.toUpperCase() : 'GBP');
      const dbPlan = await this.repository.save(plan);

      return { plan: dbPlan, message: 'Plan created.' };
    } catch (e) {
      throw e;
    }
  }

  async activateDeactivatePlan(
    planId: string,
    isActive: boolean,
  ): Promise<any> {
    try {
      if (isActive === true || isActive === false) {
        const _p = await this.repository.findOne({ where: { id: planId } });
        _p.active = isActive;
        const _plan = await this.repository.save(_p);

        return { plan: _plan };
      } else {
        throw new BadRequestException('Value must be boolean.');
      }
    } catch (e) {
      throw e;
    }
  }

  async deletePlan(planId: string): Promise<any> {
    try {
      const _plan = await this.repository.softDelete(planId);
      return { plan: _plan };
    } catch (e) {
      throw e;
    }
  }
}
