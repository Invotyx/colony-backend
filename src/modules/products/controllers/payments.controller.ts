import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Injectable,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { env } from 'process';
import { Auth } from 'src/decorators/auth.decorator';
import { LoginUser } from 'src/decorators/user.decorator';
import { UserEntity } from 'src/entities/user.entity';
import Stripe from 'stripe';
import { UsersService } from '../../users/services/users.service';
import { PaymentMethodDto } from '../dto/payment-methods.dto';
import { PaymentMethodsService } from '../services/payment-methods.service';

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
      let _user = await this.userService.findOne(user.id);

      if (_user.customerId) {
        const pm = await this.paymentService.createPaymentMethod(_user, data);
        return pm;
      } else {
        const stripe_user = await this.stripe.customers.create({
          email: _user.email,
          name: _user.firstName + ' ' + _user.lastName,
          phone: _user.mobile,
        });

        _user.customerId = stripe_user.id;
        _user = await this.userService.repository.save(_user);
        const pm = await this.paymentService.createPaymentMethod(_user, data);
        return pm;
      }
    } catch (e) {
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
}
