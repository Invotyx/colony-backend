import { BadRequestException, Injectable } from '@nestjs/common';
import { env } from 'process';
import { CountryRepository } from 'src/services/city-country/repos/country.repo';
import { nanoid } from 'src/shared/random-keygen';
import Stripe from 'stripe';
import { interval, PlansDto } from '../dto/plans.dto';
import { PlansRepository } from '../repos/plans.repo';

@Injectable()
export class PlansService {
  private stripe: Stripe;
  constructor(
    public readonly repository: PlansRepository,
    public readonly country: CountryRepository,
  ) {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2020-08-27',
    });
  }

  public async getPlanDetails() {
    try {
      const plan = await this.repository.findOne();
      if (plan) {
        return [plan];
      } else {
        return 'No record found.';
      }
    } catch (e) {
      throw new BadRequestException(e, 'An Exception Occurred');
    }
  }

  public async planActivatedCountries() {
    try {
      const countries = await this.country.find({ where: { active: true } });
      if (countries) {
        return countries;
      } else {
        return { message: 'No records found.' };
      }
    } catch (e) {
      throw new BadRequestException(e);
    }
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
