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

  public async generateHtmlForInvoice(id: number, model: UserEntity) {
    const invoice = await this.repository.findOne({
      where: { id, user: model },
    });
    if (invoice) {
      const check = invoice.costType == 'base-plan-purchase' && invoice.meta;
      const json = check ? JSON.parse(invoice.meta) : null;
      let invoice_items;
      let email_body_text;
      if (check) {
        let phone_cost = 0;
        json.phones.forEach((phone) => {
          phone_cost = phone_cost + phone.cost;
        });
        invoice_items = `
                <tr><td>Base Package</td><td style="text-align: right;">£${json.subscription}</td></tr>
                <tr><td>Phone Number</td><td style="text-align: right;">£${phone_cost}</td></tr>
                <tr><td>Fans</td><td style="text-align: right;">£${json.fan}</td></tr>
          `;

        email_body_text = env.BASE_PHONE_FANS_TEXT;
      } else if (invoice.costType == 'number-purchase') {
        invoice_items = `
                <tr><td>Phone Number Purchase</td><td style="text-align: right;">£${invoice.cost}</td></tr>
          `;
        email_body_text = env.NUMBER_PURCHASE_TEXT;
      } else if (invoice.costType == 'sms-dues') {
        invoice_items = `
                <tr><td>SMS Cost</td><td style="text-align: right;">£${invoice.cost}</td></tr>
          `;
        email_body_text = env.SMS_THRESHOLD_TEXT;
      } else {
        invoice_items = `
                <tr><td>Base Package Subscription</td><td style="text-align: right;">£${invoice.cost}</td></tr>
          `;
        email_body_text = env.BASE_PACKAGE_TEXT;
      }

      const html = `
        		<!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <title>Invoice</title>
                <style>
                  @media print {
                    .noprint {
                        visibility: hidden;
                    }
                  }
              </style>
                <link rel="stylesheet" media="screen" href="https://fontlibrary.org//face/glacial-indifference" type="text/css"  media="print" />
              </head>
              <body>
                <table style="width: 100%; margin:auto;">
                  <tr>
                    <td style="width: 50%; padding:2% 4%;"><img src="${env.MAIN_LOGO}" width="60"></td>
                    <td style="width: 50%;text-align: right;  padding:2% 4%;"><p style="font-size:30px;font-style: italic; font-weight: 600; color: #e05d49;">INVOICE</p>
                      <p style="font-size:12px;margin-top:-20px;">No. ${invoice.chargeId}</p></td>
                  </tr>
                  <tr><td colspan="2" style=""><hr style="margin: auto; height: 1px;background:#d6d3ce;border: 1px #d6d3ce ;"></td><td></td></tr>
                </table>
                <table style="width: 100%; margin:auto; padding:0% 4%; font-family: GlacialIndifferenceRegular">
                  <tr>
                    <td colspan="2"><br><br><br><b>Hi ${model.firstName} ${model.lastName}</b></td><td></td>
                  </tr>
                  <tr>
                    <td colspan="2" style="width: 100%; font-family: opensanslight;font-size: 12px; font-family: GlacialIndifferenceRegular; text-align:justify;">
                      ${email_body_text}
                    </td> <td></td>
                  </tr>
                  <tr>
                    <td colspan="2"><br><br><br><br><br><br>ISSUED ON</td><td></td>
                  </tr>
                  <tr style="width:100%">
                    <td colspan="2"><h3 style="font-style: italic;color:#e05d49;margin-top:-3px ;">${invoice.createdAt}</h3></td><td></td>
                  </tr>
                </table>
                <table style="font-family: GlacialIndifferenceRegular; width: 100%; margin:auto; padding:0 4%;">
                  <tr style="border-bottom:1px;">
                    <td style="border-bottom:1px;"><b>Description</b></td><td style="text-align: right;"><b>Subtotal</b></td>
                  </tr>
                  <tr><td colspan="2" style="width: 100%;"><hr style=" margin: auto; height: 1px;background:#d6d3ce;border: 1px #d6d3ce ;"></td><td></td></tr>
                  ${invoice_items}
                  <tr><td colspan="2" style="width: 100%;"><hr style=" margin: auto; height: 1px;background:#d6d3ce;border: 1px #d6d3ce ;"></td><td></td></tr>
                  <tr><td></td><td style="text-align: right;"><b>TOTAL:  </b> £${invoice.cost}</td></tr>
                </table>
                <table style="font-family: GlacialIndifferenceRegular; width: 100%; margin:auto;">
                  <tr>
                    <td colspan="2"; style="text-align: center;" class="noprint"><br><br><br>
                      <a href="${env.PRIVACY_POLICY}" style="font-size:12px; color: black; padding: 10px;">Privacy and policy</a> 
                      <a href="${env.TERMS_OF_SERVICE}" style="font-size:12px; color: black; padding: 10px;">Terms & Conditions</a> 
                      <a href="${env.FAQS}" style="font-size:12px; color: black; padding: 10px;">FAQ</a></td><td></td>
                  </tr>

                  
                </table>
                <table style="font-family: GlacialIndifferenceRegular; width: 100%; margin:auto; background-color: #d6d3ce; padding: 1%;">
                  <tr>
                    <td style="width: 50%; padding:2% 4%;"><img src="${env.FOOTER_LOGO}" width="150"></td>
                    
                    <td style="width: 50%;text-align: right;"><p style="font-size:12px;">${env.SUPPORT_EMAIL}<br>
                      ${env.CONTACT_NUMBER}<br>
                      ${env.PUBLIC_APP_URL}<br>
                      ${env.MAILING_ADDRESS}</p></td>
                  </tr>
                </table>
                <script>
                    setTimeout(function(){ window.print(); }, 3000);
                </script>

              </body>
              </html>
        `;

      return html;
    }

    return null;
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
      //console.log('charge :', charge);
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
        //console.log('payment charge failed with details:');
        //console.log(charge);
        return false;
      }
    }
  }
}
