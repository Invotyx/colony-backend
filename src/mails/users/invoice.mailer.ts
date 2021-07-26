import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { env } from 'process';
import { AppConfig } from '../../configs/app.config';
import { PaymentHistoryEntity } from '../../modules/payment-history/entities/purchaseHistory.entity';
import { UserEntity } from '../../modules/users/entities/user.entity';
import { MailClient } from '../../services/mail/mail.service';

@Injectable()
export class InvoiceEmailSender {
  constructor(private readonly mailClient: MailClient) {}

  async sendEmail(
    model: UserEntity,
    invoice: PaymentHistoryEntity,
  ): Promise<boolean> {
    try {
      //console.log('model: ', model);
      if (model && invoice) {
        const appConfig = await AppConfig();

        const html = `<!doctype html>
<html class="no-js" lang="" style="box-sizing: border-box;line-height: 1.15;-webkit-text-size-adjust: 100%;">

<head style="box-sizing: border-box;">
  <meta charset="utf-8" style="box-sizing: border-box;">
  <title style="box-sizing: border-box;">Invoice </title>
  <meta name="viewport" content="width=device-width, initial-scale=1" style="box-sizing: border-box;">
  
</head>
<body style="box-sizing: border-box;font-size: 16px;margin: 0;font-family: system-ui,
		-apple-system, 
		'Segoe UI',
		Roboto,
		Helvetica,
		Arial,
		sans-serif,
		'Apple Color Emoji',
		'Segoe UI Emoji';">
  
<div class="web-container" style="box-sizing: border-box;max-width: 800px;margin: 0 auto;padding: 50px;">
  <div class="page-container" style="box-sizing: border-box;display: none;">
  Page
  <span class="page" style="box-sizing: border-box;"></span>
  of
  <span class="pages" style="box-sizing: border-box;"></span>
</div>

<div class="logo-container" style="box-sizing: border-box;margin: 20px 0 70px 0;text-align: center;">
  <img style="height: 50px;box-sizing: border-box;" src="https://colony.ga/_next/image?url=%2Fimages%2Findex-logo.svg&w=256&q=75">
</div>

<table class="invoice-info-container" style="box-sizing: border-box;width: 100%;border-collapse: collapse;text-indent: 0;border-color: inherit;font-size: 0.875em;">
  <tr style="box-sizing: border-box;">
    <td rowspan="2" class="client-name" style="box-sizing: border-box;padding: 4px 0;font-size: 1.5em;vertical-align: top;">
      ${model.firstName} ${model.lastName}
    </td>
    <td style="box-sizing: border-box;padding: 4px 0;text-align: right;">
      Colony Systems
    </td>
  </tr>
  <tr style="box-sizing: border-box;">
    <td style="box-sizing: border-box;padding: 4px 0;text-align: right;">
      Street A, London, 
    </td>
  </tr>
  <tr style="box-sizing: border-box;">
    <td style="box-sizing: border-box;padding: 4px 0;">
      Invoice Date: <strong style="box-sizing: border-box;font-weight: bolder;">${invoice.createdAt}</strong>
    </td>
    <td style="box-sizing: border-box;padding: 4px 0;text-align: right;">
      United Kingdom, 94103B
    </td>
  </tr>
  <tr style="box-sizing: border-box;">
    <td style="box-sizing: border-box;padding: 4px 0;">
      Invoice No: <strong style="box-sizing: border-box;font-weight: bolder;">${invoice.chargeId}</strong>
    </td>
    <td style="box-sizing: border-box;padding: 4px 0;text-align: right;">
      ${env.SUPPORT_EMAIL}
    </td>
  </tr>
</table>


<table class="line-items-container" style="box-sizing: border-box;width: 100%;border-collapse: collapse;text-indent: 0;border-color: inherit;margin: 70px 0;font-size: 0.875em;">
  <thead style="box-sizing: border-box;">
    <tr style="box-sizing: border-box;">
      <th class="heading-quantity" style="box-sizing: border-box;text-align: left;color: #999;border-bottom: 2px solid #ddd;padding: 10px 0 15px 0;font-size: 0.75em;text-transform: uppercase;width: 50px;">Qty</th>
      <th class="heading-description" style="box-sizing: border-box;text-align: left;color: #999;border-bottom: 2px solid #ddd;padding: 10px 0 15px 0;font-size: 0.75em;text-transform: uppercase;">Description</th>
      <th class="heading-price" style="box-sizing: border-box;text-align: right;color: #999;border-bottom: 2px solid #ddd;padding: 10px 0 15px 0;font-size: 0.75em;text-transform: uppercase;width: 100px;">Price</th>
      <th class="heading-subtotal" style="box-sizing: border-box;text-align: right;color: #999;border-bottom: 2px solid #ddd;padding: 10px 0 15px 0;font-size: 0.75em;text-transform: uppercase;width: 100px;">Subtotal</th>
    </tr>
  </thead>
  <tbody style="box-sizing: border-box;">
    <tr style="box-sizing: border-box;">
      <td style="box-sizing: border-box;padding: 15px 0;">1</td>
      <td style="box-sizing: border-box;padding: 15px 0;">${invoice.description}</td>
      <td class="right" style="box-sizing: border-box;padding: 15px 0;text-align: right;">£${invoice.cost}</td>
      <td class="bold" style="box-sizing: border-box;padding: 15px 0;font-weight: bold;text-align: right;">£${invoice.cost}</td>
    </tr>
  </tbody>
</table>


<table class="line-items-container has-bottom-border" style="box-sizing: border-box;width: 100%;border-collapse: collapse;text-indent: 0;border-color: inherit;margin: 70px 0;font-size: 0.875em;margin-bottom: 0;">
  <thead style="box-sizing: border-box;">
    <tr style="box-sizing: border-box;">
      <th style="box-sizing: border-box;text-align: left;color: #999;border-bottom: 2px solid #ddd;padding: 10px 0 15px 0;font-size: 0.75em;text-transform: uppercase;">Payment Info</th>
      <th style="box-sizing: border-box;text-align: left;color: #999;border-bottom: 2px solid #ddd;padding: 10px 0 15px 0;font-size: 0.75em;text-transform: uppercase;">Paid On</th>
      <th style="box-sizing: border-box;text-align: right;color: #999;border-bottom: 2px solid #ddd;padding: 10px 0 15px 0;font-size: 0.75em;text-transform: uppercase;">Total Paid</th>
    </tr>
  </thead>
  <tbody style="box-sizing: border-box;">
    <tr style="box-sizing: border-box;">
      <td class="payment-info" style="box-sizing: border-box;padding: 15px 0;width: 38%;font-size: 0.75em;line-height: 1.5;">
        
      </td>
      <td class="large" style="box-sizing: border-box;padding: 15px 0;font-size: 1.75em;">${invoice.createdAt}</td>
      <td class="large total" style="box-sizing: border-box;padding: 15px 0;font-size: 1.75em;font-weight: bold;color: #fb7578;text-align: right;">${invoice.cost}</td>
    </tr>
  </tbody>
</table>

<div class="footer" style="box-sizing: border-box;margin-top: 100px;">
  <div class="footer-info" style="box-sizing: border-box;float: right;margin-top: 5px;font-size: 0.75em;color: #ccc;">
    <span style="box-sizing: border-box;padding: 0 5px;color: black;">${env.SUPPORT_EMAIL}</span> |
    <span style="box-sizing: border-box;padding: 0 5px;color: black;">${env.CONTACT_NUMBER}</span> |
    <span style="box-sizing: border-box;padding: 0 5px;color: black;padding-right: 0;">${env.APP_URL}</span>
  </div>
  <div class="footer-thanks" style="box-sizing: border-box;font-size: 1.125em;">
    <span alt="heart" style="box-sizing: border-box;display: inline-block;position: relative;top: 1px;width: 16px;margin-right: 4px;">❤️</span>
    <span style="box-sizing: border-box;">Thank you!</span>
  </div>
</div>

</div>

</body></html>`;

        const mail = await this.mailClient.send({
          to: {
            name: model.firstName + ' ' + model.lastName,
            address: model.email,
          },
          from: env.MAIL_FROM_ADDRESS,
          subject: 'Invoice | Colony Systems',
          html: html,
          text: html,
        });
        return mail;
      }
    } catch (ex) {
      //console.log(ex);
      throw new HttpException(
        'Mail server down, unable to send reset password email!',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
