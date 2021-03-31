import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
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
      if (plan.planType === 'bundle' && plan.smsCount < 1) {
        throw new HttpException(
          'For bundle plan sms count should be greater than 0.',
          HttpStatus.BAD_REQUEST,
        );
      } else {
      /*  else if (
        plan.planType === 'phoneOnly' &&
        (!plan.phoneCount || plan.phoneCount < 1)
      ) {
        throw new HttpException(
          'For phone only plan phone credits should be greater than 0.',
          HttpStatus.BAD_REQUEST,
        );
      } else if (
        plan.planType === 'smsOnly' &&
        (!plan.smsCount || plan.smsCount < 1)
      ) {
        throw new HttpException(
          'For sms only plan sms credits should be greater than 0.',
          HttpStatus.BAD_REQUEST,
        );
      } */
        /* if (plan.planType === 'smsOnly') {
          plan.phoneCount = 0;
        }
        if (plan.planType === 'phoneOnly') {
          plan.smsCount = 0;
        } */


        const newPlan = await this.stripe.plans.create({
          amount_decimal: (plan.amount_decimal * 100).toString(),
          product: productId,
          currency: plan.currency != '' ? plan.currency.toUpperCase() : 'USD',
          interval:
            plan.interval.toString() === 'month' ||
            plan.interval.toString() === ''
              ? 'month'
              : 'year',
          active: true,
          nickname: plan.nickname,
        });

        if (newPlan) {
          plan.id = newPlan.id;
          plan.product = productId as any;
          plan.active = true;

          (plan.interval =
            plan.interval.toString() === 'month' ||
            plan.interval.toString() === ''
              ? interval.month
              : interval.year),
            (plan.currency =
              plan.currency != '' ? plan.currency.toUpperCase() : 'USD');
          const dbPlan = await this.repository.save(plan);

          return { plan: dbPlan, message: 'Plan created.' };
        } else {
          throw new HttpException(
            'No such product exists',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    } catch (e) {
      throw e;
    }
  }
  /* 
  async createPriceInStripe(plan: PlansDto, productId: string): Promise<any> {
    try {
      if (
        plan.planType === 'bundle' &&
        (plan.smsCount < 1 || plan.phoneCount < 1)
      ) {
        throw new HttpException(
          'For bundle plan sms and phone credits should be greater than 0.',
          HttpStatus.BAD_REQUEST,
        );
      } else if (
        plan.planType === 'phoneOnly' &&
        (!plan.phoneCount || plan.phoneCount < 1)
      ) {
        throw new HttpException(
          'For phone only plan phone credits should be greater than 0.',
          HttpStatus.BAD_REQUEST,
        );
      } else if (
        plan.planType === 'smsOnly' &&
        (!plan.smsCount || plan.smsCount < 1)
      ) {
        throw new HttpException(
          'For sms only plan sms credits should be greater than 0.',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        console.log('here 3 === === === ===');
        if (plan.planType === 'smsOnly') {
          plan.phoneCount = 0;
        }
        if (plan.planType === 'phoneOnly') {
          plan.smsCount = 0;
        }
        const newPlan = await this.stripe.prices.create({
          product: productId,
          unit_amount_decimal: (plan.amount_decimal * 100).toString(),
          currency: plan.currency,
          active: true,
          nickname: plan.nickname,
        });
        if (newPlan) {
          plan.id = newPlan.id;
          plan.product = productId as any;
          plan.active = true;
          const dbPlan = await this.repository.save(plan);

          return { plan: dbPlan };
        } else {
          throw new HttpException(
            'No such product exists',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    } catch (e) {
      throw e;
    }
  }
 */
  async activateDeactivatePlan(
    planId: string,
    isActive: boolean,
  ): Promise<any> {
    try {
      if (isActive === true || isActive === false) {
        if (planId.includes('plan_')) {
          await this.stripe.plans.update(planId, {
            active: isActive,
          });
        } /*  else {
          await this.stripe.prices.update(planId, {
            active: isActive,
          });
        } */
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
      if (planId.includes('plan_')) {
        await this.stripe.plans.del(planId);
      }
      const _plan = await this.repository.softDelete(planId);
      return { plan: _plan };
    } catch (e) {
      throw e;
    }
  }
}
