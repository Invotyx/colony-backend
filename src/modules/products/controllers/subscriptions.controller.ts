import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../../../decorators/auth.decorator';
import { LoginUser } from '../../../decorators/user.decorator';
import { UserEntity } from '../../../modules/users/entities/user.entity';
import { UsersService } from '../../../modules/users/services/users.service';
import { ROLES } from '../../../services/access-control/consts/roles.const';
import { SubscriptionsDto } from '../dto/subscriptions.dto';
import { SubscriptionsService } from '../services/subscriptions.service';

@Injectable()
@Controller('subscriptions')
@ApiTags('subscriptions')
export class SubscriptionsController {
  constructor(
    public readonly subscriptionService: SubscriptionsService,
    public readonly userService: UsersService,
  ) {}

  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Post('')
  public async createSubscription(
    @LoginUser() customer: UserEntity,
    @Body() subscription: SubscriptionsDto,
  ) {
    try {
      const result = await this.subscriptionService.createSubscription(
        customer,
        subscription,
      );
      if (result.message) {
        return result;
      } else {
        throw new BadRequestException('An error occurred');
      }
    } catch (e) {
      throw new BadRequestException(e, 'An exception occurred');
    }
  }

  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Get('')
  public async getSubscriptions(@LoginUser() customer: UserEntity) {
    try {
      const _user = await this.userService.findOne(customer.id);
      const result = await this.subscriptionService.getSubscriptions(_user);

      return result;
    } catch (e) {
      throw new BadRequestException(e, 'An exception occurred');
    }
  }
  /* 
  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Put(':subId')
  public async updateSubscriptions(
    @LoginUser() customer: UserEntity,
    @Param('subId') subId: string,
    @Body('planId') planId: string,
  ) {
    try {
      const result = await this.subscriptionService.updateSubscription(
        customer,
        subId,
        planId,
      );

      return result;
    } catch (e) {
      throw new BadRequestException(e, 'An exception occurred');
    }
  }
 */
  @Auth({ roles: [ROLES.ADMIN, ROLES.INFLUENCER] })
  @Delete(':subId')
  public async cancelSubscriptions(
    @LoginUser() customer: UserEntity,
    @Param('subId') subId: string,
  ) {
    try {
      const result = await this.subscriptionService.cancelSubscription(subId);

      return result;
    } catch (e) {
      throw new BadRequestException(e, 'An exception occurred');
    }
  }
}
