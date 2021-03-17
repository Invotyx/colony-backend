import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/decorators/auth.decorator';
import { LoginUser } from 'src/decorators/user.decorator';
import { UserEntity } from 'src/entities/user.entity';
import { UsersService } from 'src/modules/users/services/users.service';
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

  @Auth({})
  @Post('')
  public async createSubscription(
    @LoginUser() customer: UserEntity,
    @Body() subscription: SubscriptionsDto,
  ) {
    try {
      const _user = await this.userService.findOne(customer.id);
      const result = await this.subscriptionService.createSubscription(
        _user,
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

  @Auth({})
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

  @Auth({})
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

  @Auth({})
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
