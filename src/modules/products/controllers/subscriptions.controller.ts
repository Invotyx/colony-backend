import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Injectable,
  Post,
} from '@nestjs/common';
import { env } from 'process';
import { Auth } from 'src/decorators/auth.decorator';
import { LoginUser } from 'src/decorators/user.decorator';
import { UserEntity } from 'src/entities/user.entity';
import { UsersService } from 'src/modules/users/services/users.service';
import Stripe from 'stripe';
import { SubscriptionsDto } from '../dto/subscriptions.dto';
import { SubscriptionsService } from '../services/subscriptions.service';

@Injectable()
@Controller('subscriptions')
export class SubscriptionsController {
  private stripe: Stripe;
  constructor(
    public readonly subscriptionService: SubscriptionsService,
    public readonly userService: UsersService,
  ) {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2020-08-27',
    });
  }

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
      if (result) {
        return 'Subscription Created';
      } else {
        return new BadRequestException('An error occurred');
      }
    } catch (e) {
      return new BadRequestException(e, 'An exception occurred');
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
      return new BadRequestException(e, 'An exception occurred');
    }
  }
}
