import { BadRequestException, Injectable } from '@nestjs/common';
import { env } from 'process';
import { UserEntity } from 'src/entities/user.entity';
import Stripe from 'stripe';
import { PaymentMethodDto } from '../dto/payment-methods.dto';
import { PaymentMethodsRepository } from '../repos/payment-methods.repo';

@Injectable()
export class PaymentMethodsService {
  private stripe: Stripe;
  constructor(public readonly repository: PaymentMethodsRepository) {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2020-08-27',
    });
  }

  public async createPaymentMethod(
    customer: any,
    methodDetails: PaymentMethodDto,
  ): Promise<any> {
    try {
      if (methodDetails.name && methodDetails.token) {
        const pm = await this.stripe.paymentMethods.create({
          type: 'card',
        
          card: {
            token: methodDetails.token
          },
        });

        await this.stripe.paymentMethods.attach(pm.id, {
          customer: customer.customerId,
        });

        const check = await this.repository.findOne({
          where: { fingerprint: pm.card.fingerprint },
        });

        if (check) {
          await this.stripe.paymentMethods.detach(check.id);
          check.name = methodDetails.name;
          check.last4_card = pm.card.last4;
          check.type = pm.card.brand;
          check.user = customer;
          check.fingerprint = pm.card.fingerprint;
          check.default = true;
          await this.repository.delete(check.id);
          check.id = pm.id;
          await this.repository.save(check);
          await this.stripe.customers.update(customer.customerId, {
            invoice_settings: { default_payment_method: pm.id },
          });
          return { message: 'Payment method added' };
        } else {
          const def = await this.repository.findOne({ where: { default: true } });
          def.default = false;
          await this.repository.save(def);
          await this.repository.save({
            id: pm.id,
            last4_card: pm.card.last4,
            type: pm.card.brand,
            user: customer,
            fingerprint: pm.card.fingerprint,
            name: methodDetails.name,
            default: true
          });
          await this.stripe.customers.update(customer.customerId, {
            invoice_settings: { default_payment_method: pm.id },
          });
          return { message: 'Payment method added' };
        }
      } else {
        throw new BadRequestException("Invalid Data entered");
      }
    } catch (e) {
      throw e;
    }
  }

  public async setDefaultPaymentMethod(
    customer: UserEntity,
    paymentId:string
  ) {
    try {
      const exist = await this.repository.findOne({ where: { id: paymentId } });
      
      if (exist) {
        const exDef = await this.repository.findOne({ where: { default: true } });
        if (exDef) {
          exDef.default = false;
          await this.repository.save(exDef);
        }
        await this.stripe.customers.update(customer.customerId, {
          invoice_settings: { default_payment_method: exist.id },
        });
        exist.default = true;
        await this.repository.save(exist);
        return { message: 'Payment method is set as default.' };
      } else {
        throw new BadRequestException('Payment method does not exist.');
      }
    } catch (e) {
      throw e;
    }
  }

  public async removePaymentMethod(inf:UserEntity,pid:string) {
    try {
      const paymentMethod = await this.repository.findOne({
        where: { user: inf, id: pid },
      });

      if (paymentMethod) {
        await this.stripe.paymentMethods.detach(pid);
        await this.repository.delete(pid);
        return { message: 'Payment method deleted.' };
      } else {
        throw new BadRequestException('Payment method does not exist.');
      }

    } catch (e) {
      throw e;
    }

  }

  public async getPaymentMethods(customer: any): Promise<any> {
    try {
      const paymentMethods: any = await this.repository.find({
        where: { user: customer.id },
      });
      return { paymentMethods };
    } catch (e) {
      throw e;
    }
  }
}
