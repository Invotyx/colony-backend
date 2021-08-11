import { BadRequestException, Injectable } from '@nestjs/common';
import { env } from 'process';
import Stripe from 'stripe';
import { UserEntity } from '../../users/entities/user.entity';
import { PaymentMethodDto } from './payment-methods.dto';
import { PaymentMethodsEntity } from './payment-methods.entity';
import { PaymentMethodsRepository } from './payment-methods.repo';

@Injectable()
export class PaymentMethodsService {
  private stripe: Stripe;
  constructor(private readonly repository: PaymentMethodsRepository) {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2020-08-27',
    });
  }

  public async findOne(condition?: any) {
    if (condition) return this.repository.findOne(condition);
    else return this.repository.findOne();
  }

  public async find(condition?: any) {
    if (condition) return this.repository.find(condition);
    else return this.repository.find();
  }

  public async save(obj: PaymentMethodsEntity) {
    return this.repository.save(obj);
  }

  public async createPaymentMethod(
    customer: UserEntity,
    methodDetails: PaymentMethodDto,
  ): Promise<any> {
    try {
      if (methodDetails.name && methodDetails.token) {
        const pm = await this.stripe.paymentMethods.create({
          type: 'card',

          card: {
            token: methodDetails.token,
          },
        });
        await this.stripe.paymentMethods.attach(pm.id, {
          customer: customer.customerId,
        });


        const sameFinger = await this.repository.findOne({
          where: { fingerprint: pm.card.fingerprint, user: customer },
        });

        if (sameFinger) {
          await this.repository.remove(sameFinger);
        }
        
        const def = await this.repository.findOne({
          where: { default: true, user: customer },
        });
        if (def) {
          def.default = false;
          await this.repository.save(def);
        }
        let check = new PaymentMethodsEntity();

        check.name = methodDetails.name;
        check.last4_card = pm.card.last4;
        check.type = pm.card.brand;
        check.user = customer;
        check.fingerprint = pm.card.fingerprint;
        check.expiry =
          pm.card.exp_month.toString() + '/' + pm.card.exp_year.toString();
        check.default = true;
        check.id = pm.id;
        await this.repository.save(check);
        await this.stripe.customers.update(customer.customerId, {
          invoice_settings: { default_payment_method: pm.id },
        });
        return { message: 'Payment method added' };
      } else {
        throw new BadRequestException('Invalid Data entered');
      }
    } catch (e) {
      ////console.log(e, 'exp === inner ');
      throw e;
    }
  }

  public async setDefaultPaymentMethod(
    customer: UserEntity,
    paymentId: string,
  ) {
    try {
      const exist = await this.repository.findOne({
        where: { id: paymentId, user: customer },
      });
      ////console.log(exist, '=== === ===');
      if (exist) {
        const exDef = await this.repository.findOne({
          where: { default: true, user: customer },
        });

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

  public async removePaymentMethod(inf: UserEntity, pid: string) {
    try {
      const paymentMethod = await this.repository.findOne({
        where: { user: inf, id: pid },
      });

      if (paymentMethod) {
        if (paymentMethod.default == true) {
          await this.repository.query(
            `UPDATE payment_methods SET "default"=TRUE WHERE "createdAt"=(SELECT MAX(pm."createdAt") as "createdAt" FROM payment_methods pm WHERE ( "pm"."default"=FALSE AND "pm"."userId"=$1 )) AND "userId"=$1`,
            [inf.id],
          );
        }
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
        order: { createdAt: 'DESC' },
      });
      return { paymentMethods };
    } catch (e) {
      throw e;
    }
  }
}
