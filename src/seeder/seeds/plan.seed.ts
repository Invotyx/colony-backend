import { Injectable } from '@nestjs/common';
import { interval } from '../../modules/products/plan/plans.dto';
import { PlansService } from '../../modules/products/plan/plans.service';
import { nanoid } from '../../shared/random-keygen';
import { Seeder } from '../../decorators/common.decorator';
import { ISeed } from '../seeds.interface';
import { env } from 'process';

@Injectable()
@Seeder()
export class PlanSeed implements ISeed {
  constructor(private readonly service: PlansService) {}
  async up() {
    const check = await this.service.findOne();

    if (!check) {
      await this.service.createPlanInDb({
        active: true,
        amount_decimal: +env.PLAN_AMOUNT,
        currency: 'GBP',
        id: nanoid(),
        interval: interval.month,
        nickname: env.PLAN_NAME,
        recurring: 'recurring',
        subscriberCost: +env.PLAN_SUB_COST,
        threshold: +env.PLAN_THRESHOLD,
      });
    }
  }
  async down() {
    //
  }
}
