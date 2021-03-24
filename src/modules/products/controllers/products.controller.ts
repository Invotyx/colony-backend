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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/decorators/auth.decorator';
import { LoginUser } from 'src/decorators/user.decorator';
import { PlansEntity } from 'src/entities/plans.entity';
import { UserEntity } from 'src/entities/user.entity';
import { ROLES } from 'src/services/access-control/consts/roles.const';
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
        const check = await this.planService.repository.findOne({ where: { nickname: data.nickname } });
        if (!check) {
          if (data.planType === 'smsOnly') {
            data.recurring == 'one_time';
          }
          if (data.recurring == 'recurring') {
            const plan = await this.planService.createPlanInStripe(data, pid);
            return plan;
          } else {
            const plan = await this.planService.createPriceInStripe(data, pid);
            return plan;
          }
        } else {
          throw new BadRequestException('Plan with this name already exists.');
        }
      } else {
        throw new HttpException('Invalid product. ', HttpStatus.BAD_REQUEST);
      }
    } catch (e) {
      throw new BadRequestException(e, 'An Exception Occurred');
    }
  }

  @Auth({})
  @Get(':pid/plan/')
  public async getPlans(@LoginUser() user:UserEntity, @Param('pid') pid: string) {
    try {
      let plan: PlansEntity[];
      
      if (user.roles[0].role === ROLES.ADMIN) {
        plan = await this.planService.repository.find({
          where: { product: pid },
        });
      } else {
        plan = await this.planService.repository.find({
          where: { product: pid, active: true }
        });
      }

      if (plan) {

        const bundle = plan.filter(p => p.planType === 'bundle');
        const smsOnly = plan.filter(p => p.planType === 'smsOnly');
        const phoneOnly = plan.filter(p => p.planType === 'phoneOnly');
        
        return { bundledPlan: bundle, smsOnlyPlans: smsOnly, phoneOnlyPlans: phoneOnly };
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
