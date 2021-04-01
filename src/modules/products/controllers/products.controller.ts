import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Injectable,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/decorators/auth.decorator';
import { LoginUser } from 'src/decorators/user.decorator';
import { PlansEntity } from 'src/entities/plans.entity';
import { UserEntity } from 'src/entities/user.entity';
import { ROLES } from 'src/services/access-control/consts/roles.const';
import { CountryRepository } from 'src/services/city-country/repos/country.repo';
import { PlansDto } from '../dto/plans.dto';
import { PlansService } from '../services/plans.service';
import { ProductsService } from '../services/products.service';

@Injectable()
@Controller('products')
@ApiTags('products')
export class ProductsController {
  constructor(
    public readonly planService: PlansService,
    public readonly productsService: ProductsService,
    public readonly country:CountryRepository
  ) {}

  @Get('')
  public async getProducts() {
    try {
      const products = await this.productsService.getProducts();
      if (products) {
        return products;
      } else {
        return 'No records found.';
      }
    } catch (e) {
      throw new BadRequestException(e, 'An Exception Occurred');
    }
  }

  @Get(':pid')
  public async getProduct(@Param('pid') pid: string) {
    try {
      const product = await this.productsService.getProduct(pid);
      if (product) {
        return product;
      } else {
        return 'No record found.';
      }
    } catch (e) {
      throw new BadRequestException(e, 'An Exception Occurred');
    }
  }

  @Auth({ roles: [ROLES.ADMIN] })
  @Post(':pid/plan/')
  public async createPlan(@Param('pid') pid: string, @Body() data: PlansDto) {
    //createPlanInStripe
    try {
      if (pid && pid !== 'undefined') {
        if (data.planType === 'bundle') {
          const check = await this.planService.repository.findOne({
            where: { nickname: data.nickname },
          });
          if (!check) {
            /* if (data.planType === 'smsOnly') {
              data.recurring == 'one_time';
            } */
            const checkSamePricePlans = await this.planService.repository.findOne({ where: { amount_decimal: data.amount_decimal, country: data.country } });
            if (checkSamePricePlans)
            {
              throw new BadRequestException('Plan with same price for this country already exists.');
            }

            const checkSameSmsPlans = await this.planService.repository.findOne({ where: { smsCount: data.smsCount, country: data.country } });
            if (checkSameSmsPlans)
            {
              throw new BadRequestException('Plan with same sms count for this country already exists.');
            }
            const plan = await this.planService.createPlanInStripe(data, pid);
            return plan;
            /*if (data.recurring == 'recurring') {
              
            }  else {
              const plan = await this.planService.createPriceInStripe(
                data,
                pid,
              );
              return plan;
            } */
          } else {
            throw new BadRequestException(
              'Plan with this name already exists.',
            );
          }
        } else {
          throw new HttpException(
            'Invalid plan type. ',
            HttpStatus.BAD_REQUEST,
          );
        }
      } else {
        throw new HttpException('Invalid product. ', HttpStatus.BAD_REQUEST);
      }
    } catch (e) {
      throw new BadRequestException(e, 'An Exception Occurred');
    }
  }

  @Auth({})
  @Get('plan/countries')
  public async planActivatedCountries() {
    const countries = await this.country.find({ where: { active: true } });
    if (countries) {
      return countries;
    } else {
      return { message: "No records found." };
    }
  }

  @Auth({})
  @Get(':pid/plan')
  public async getPlans(
    @LoginUser() user: UserEntity,
    @Param('pid') pid: string,
    @Query('countryId') countryId: string,
  ) {
    try {
      let plan: PlansEntity[];

      if (user.roles[0].role === ROLES.ADMIN) {
        plan = await this.planService.repository.find({
          where: { product: pid },
        });
      } else {
        plan = await this.planService.repository.find({
          where: { product: pid, active: true, country: countryId },
        });
      }

      if (plan) {
        const bundle = plan.filter((p) => p.planType === 'bundle');
        /* const smsOnly = plan.filter((p) => p.planType === 'smsOnly');
        const phoneOnly = plan.filter((p) => p.planType === 'phoneOnly'); */

        return {
          bundledPlan: bundle,
          /* smsOnlyPlans: smsOnly,
          phoneOnlyPlans: phoneOnly, */
        };
      } else {
        return 'No records found.';
      }
    } catch (e) {
      throw new BadRequestException(e, 'An Exception Occurred');
    }
  }

  @Get(':pid/plan/:planId')
  public async getPlanDetails(@Param('planId') planId: string) {
    try {
      const plan = await this.planService.repository.findOne({
        where: { id: planId },
      });
      if (plan) {
        return plan;
      } else {
        return 'No record found.';
      }
    } catch (e) {
      throw new BadRequestException(e, 'An Exception Occurred');
    }
  }

  @Auth({ roles: [ROLES.ADMIN] })
  @Put(':pid/plan/:planId')
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
  @Delete(':pid/plan/:planId')
  public async deletePlan(@Param('planId') planId: string) {
    try {
      const plan = await this.planService.deletePlan(planId);
      return plan;
    } catch (e) {
      throw new BadRequestException(e, 'An Exception Occurred');
    }
  }
}
