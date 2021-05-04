import { Injectable } from '@nestjs/common';
import { interval } from 'src/modules/products/dto/plans.dto';
import { PlansService } from 'src/modules/products/services/plans.service';
import { nanoid } from 'src/shared/random-keygen';
import { Seeder } from '../../decorators/common.decorator';
import { ISeed } from '../seeds.interface';

@Injectable()
@Seeder()
export class PlanSeed implements ISeed {
  constructor(private readonly service: PlansService) {}
  async up() {
    const check = await this.service.repository.findOne();

    if (!check) {
      await this.service.createPlanInDb({
        active: true,
        amount_decimal: 19.99,
        currency: 'GBP',
        id: nanoid(),
        interval: interval.month,
        nickname: 'Base Package',
        recurring: 'recurring',
        subscriberCost: 0.05,
        threshold: 50,
      });
    }
  }
  async down() {
    //
  }
}
