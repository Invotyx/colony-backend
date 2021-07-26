import { Injectable } from '@nestjs/common';
import { env } from 'process';
import Stripe from 'stripe';
import { MoreThanOrEqual } from 'typeorm';
import { InvoiceEmailSender } from '../../mails/users/invoice.mailer';
import { UserEntity } from '../../modules/users/entities/user.entity';
import { PaymentMethodsService } from '../products/payments/payment-methods.service';
import { PlansService } from '../products/plan/plans.service';
import { PaymentDuesRepository } from './due-payment.repo';
import { PaymentDuesEntity } from './entities/due-payments.entity';
import { PaymentHistoryRepository } from './payment-history.repo';

@Injectable()
export class PaymentHistoryService {
  private stripe: Stripe;
  constructor(
    private readonly repository: PaymentHistoryRepository,
    private readonly duesRepo: PaymentDuesRepository,
    private readonly planService: PlansService,
    private readonly paymentService: PaymentMethodsService,
    private readonly invoiceEmail: InvoiceEmailSender,
  ) {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2020-08-27',
    });
  }

  public find(condition: any): Promise<PaymentDuesEntity[]> {
    return this.duesRepo.find(condition);
  }
  public async history(user: UserEntity) {
    try {
      return this.repository.find({
        where: { user: user },
        order: { createdAt: 'DESC' },
      });
    } catch (e) {
      throw e;
    }
  }

  public async setDuesToZero(dues: any) {
    const due = await this.duesRepo.findOne({
      where: { costType: dues.type, user: dues.user },
    });
    if (due) {
      due.cost = 0;
      await this.duesRepo.save(due);
    }
  }

  public async updateDues(dues) {
    const due = await this.duesRepo.findOne({
      where: { costType: dues.type, user: dues.user },
    });
    if (due) {
      due.cost = +(+due.cost + parseFloat(dues.cost)).toFixed(4);
      await this.duesRepo.save(due);
    } else {
      await this.duesRepo.save({
        cost: +parseFloat(dues.cost).toFixed(4),
        costType: dues.type,
        user: dues.user,
      });
    }
  }

  public async getDues(type: string, user: UserEntity) {
    try {
      return this.duesRepo.findOne({
        where: { costType: type, user: user },
      });
    } catch (e) {
      throw e;
    }
  }

  public async addRecordToHistory(r: any) {
    try {
      return this.repository.save(r);
    } catch (e) {
      throw e;
    }
  }

  public async chargeOnThreshold(user: UserEntity) {
    const plan = await this.planService.findOne();
    const payment = await this.duesRepo.findOne({
      where: {
        cost: MoreThanOrEqual(+plan.threshold - 1),
        costType: 'sms',
        user: user,
      },
    });

    if (!payment) {
      return;
    }
    const default_pm = await this.paymentService.findOne({
      where: { default: true, user: user },
    });
    const sms = payment;

    if (default_pm) {
      // charge client here
      const charge = await this.stripe.paymentIntents.create({
        amount: Math.round(+sms.cost * 100),
        currency: 'GBP',
        capture_method: 'automatic',
        confirm: true,
        confirmation_method: 'automatic',
        customer: user.customerId,
        description: 'Sms Dues payed automatically on reaching threshold.',
        payment_method: default_pm.id,
      });
      console.log('charge :', charge);
      if (charge.status == 'succeeded') {
        await this.setDuesToZero({
          type: 'sms',
          user: user,
        });

        const record = await this.addRecordToHistory({
          user: user,
          description: 'Sms Dues payed automatically on reaching threshold.',
          cost: sms.cost,
          costType: 'sms-dues',
          chargeId: charge.id,
        });
        await this.invoiceEmail.sendEmail(user, record);
        return true;
        //send email here
      } else {
        console.log('payment charge failed with details:');
        console.log(charge);
        return false;
      }
    }
  }
}
