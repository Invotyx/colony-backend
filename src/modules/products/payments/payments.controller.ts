import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Injectable,
  Param,
  Post
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { env } from 'process';
import Stripe from 'stripe';
import { Auth } from '../../../decorators/auth.decorator';
import { LoginUser } from '../../../decorators/user.decorator';
import { UserEntity } from '../../users/entities/user.entity';
import { UsersService } from '../../users/services/users.service';
import { PaymentMethodDto } from './payment-methods.dto';
import { PaymentMethodsService } from './payment-methods.service';

@Injectable()
@Controller('payment-methods')
@ApiTags('payment-methods')
export class PaymentsController {
  private stripe: Stripe;
  constructor(
    public readonly paymentService: PaymentMethodsService,
    public readonly userService: UsersService,
  ) {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2020-08-27',
    });
  }

  @Auth({})
  @Post('')
  async addPaymentMethod(
    @LoginUser() user: UserEntity,
    @Body() data: PaymentMethodDto,
  ) {
    try {
      if (data.name && data.token) {
        if (user.customerId == null) {
          const stripe_user = await this.stripe.customers.create({
            email: user.email,
            name: user.firstName + ' ' + user.lastName,
            phone: user.mobile,
          });
          user.customerId = stripe_user.id;
          await this.userService.save(user);
        }
        const pm = await this.paymentService.createPaymentMethod(user, data);
        return pm;
      } else {
        throw new BadRequestException('Incomplete data provided.');
      }
    } catch (e) {
      ////console.log(e, 'exp === 1');
      throw new BadRequestException(e, 'An Exception Occurred');
    }
  }

  @Auth({})
  @Get('')
  async getPaymentMethods(@LoginUser() user: UserEntity) {
    try {
      const _user = await this.userService.findOne(user.id);

      const paymentMethods = await this.paymentService.getPaymentMethods(_user);
      if (paymentMethods) {
        return paymentMethods;
      } else {
        return { message: 'No records found' };
      }
    } catch (e) {
      throw new BadRequestException(e, 'An Exception Occurred');
    }
  }

  @Auth({})
  @Post('set-default/:id')
  async setDefaultPaymentMethod(
    @LoginUser() user: UserEntity,
    @Param('id') id: string,
  ) {
    try {
      const _user = await this.userService.findOne(user.id);

      const result = await this.paymentService.setDefaultPaymentMethod(
        _user,
        id,
      );
      return result;
    } catch (e) {
      throw new BadRequestException(e, 'An Exception Occurred');
    }
  }

  @Auth({})
  @Delete(':id/remove')
  async removePaymentMethod(
    @LoginUser() user: UserEntity,
    @Param('id') id: string,
  ) {
    try {
      const _user = await this.userService.findOne(user.id);
      const result = await this.paymentService.removePaymentMethod(_user, id);
      return result;
    } catch (e) {
      throw e;
    }
  }
}
