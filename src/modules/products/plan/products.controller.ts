import {
  BadRequestException,
  Controller,
  Get,
  Injectable,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../../../decorators/auth.decorator';
import { PlansService } from './plans.service';

@Injectable()
@Controller('plans')
@ApiTags('plans')
export class ProductsController {
  constructor(public readonly planService: PlansService) {}

  /* @Auth({ roles: [ROLES.ADMIN] })
  @Post('')
  @UsePipes(ValidationPipe)
  public async createPlan(@Body() data: PlansDto) {
    try {
      const check = await this.planService.repository.findOne({
        where: { nickname: data.nickname },
      });
      if (!check) {
        const checkSamePricePlans = await this.planService.repository.findOne({
          where: {
            amount_decimal: data.amount_decimal,
            country: data.country,
          },
        });
        if (checkSamePricePlans) {
          throw new BadRequestException(
            'Plan with same price for this country already exists.',
          );
        }

        const plan = await this.planService.createPlanInDb(data);
        return plan;
      } else {
        throw new BadRequestException('Plan with this name already exists.');
      }
    } catch (e) {
      throw new BadRequestException(e, 'An Exception Occurred');
    }
  } */

  @Auth({})
  @Get('countries')
  public async planActivatedCountries() {
    return this.planService.planActivatedCountries();
  }
  /* 
  @Auth({})
  @Get('')
  public async getPlans(
    @LoginUser() user: UserEntity,
    @Query('countryId') countryId: string,
  ) {
    try {
      let plan: PlansEntity[];

      if (user.roles[0].role === ROLES.ADMIN) {
        plan = await this.planService.repository.find({
          order: {
            amount_decimal: 'ASC',
          },
          relations: ['country'],
        });
      } else {
        plan = await this.planService.repository.find({
          where: { active: true, country: countryId },
          order: {
            amount_decimal: 'ASC',
          },
          relations: ['country'],
        });
      }

      if (plan) {
        return {
          plan,
        };
      } else {
        return 'No records found.';
      }
    } catch (e) {
      throw new BadRequestException(e, 'An Exception Occurred');
    }
  }
 */
  @Get('')
  public async getPlanDetails() {
    try {
      return this.planService.getPlanDetails();
    } catch (e) {
      throw new BadRequestException(e, 'An Exception Occurred');
    }
  }
  /* 
  @Auth({ roles: [ROLES.ADMIN] })
  @Put(':planId')
  public async activationTogglePlan(
    @Param('planId') planId: string,
    @Body('active') active: boolean,
  ) {
    try {
      const plan = await this.planService.activateDeactivatePlan(
        planId,
        active,
      );
      return plan;
    } catch (e) {
      throw new BadRequestException(e, 'An Exception Occurred');
    }
  }

  @Auth({ roles: [ROLES.ADMIN] })
  @Delete(':planId')
  public async deletePlan(@Param('planId') planId: string) {
    try {
      const plan = await this.planService.deletePlan(planId);
      return plan;
    } catch (e) {
      throw new BadRequestException(e, 'An Exception Occurred');
    }
  } */
}
