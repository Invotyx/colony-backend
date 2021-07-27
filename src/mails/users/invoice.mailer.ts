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
        const check = invoice.costType == 'base-plan-purchase' && invoice.meta;
        const json = check ? JSON.parse(invoice.meta) : null;
        let invoice_items;
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
        } else if (invoice.costType == 'number-purchase') {
          invoice_items = `
                <tr><td>Phone Number Purchase</td><td style="text-align: right;">£${invoice.cost}</td></tr>
          `;
        } else if (invoice.costType == 'sms-dues') {
          invoice_items = `
                <tr><td>SMS Cost</td><td style="text-align: right;">£${invoice.cost}</td></tr>
          `;
        } else {
          invoice_items = `
                <tr><td>Base Package Subscription</td><td style="text-align: right;">£${invoice.cost}</td></tr>
          `;
        }

        const html = `
        		<!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <title>Invoice</title>
                <link rel="stylesheet" media="screen" href="https://fontlibrary.org//face/glacial-indifference" type="text/css"/>
              </head>
              <body>
                <table style="width: 50%; margin:auto;">
                  <tr>
                    <td style="width: 50%; padding:2% 4%;"><img src="${env.MAIN_LOGO}" width="60"></td>
                    <td style="width: 50%;text-align: right;  padding:2% 4%;"><p style="font-size:30px;font-style: italic; font-weight: 600; color: #e05d49;">INVOICE</p>
                      <p style="font-size:12px;margin-top:-20px;">No. ${invoice.chargeId}</p></td>
                  </tr>
                  <tr><td colspan="2" style=""><hr style="margin: auto; height: 1px;background:#d6d3ce;border: 1px #d6d3ce ;"></td><td></td></tr>
                </table>
                <table style="width: 50%; margin:auto; padding:0% 4%; font-family: GlacialIndifferenceRegular">
                  <tr>
                    <td colspan="2"><br><br><br><b>Hi ${model.firstName} ${model.lastName}</b></td><td></td>
                  </tr>
                  <tr>
                    <td colspan="2" style="width: 100%; font-family: opensanslight;font-size: 12px; font-family: GlacialIndifferenceRegular; text-align:justify;">
                      You have received this email because you have subscribed to our Package in Colony Messaging and you have been charged for due payments(see details below). 
                    </td> <td></td>
                  </tr>
                  <tr>
                    <td colspan="2"><br><br><br><br><br><br>ISSUED ON</td><td></td>
                  </tr>
                  <tr style="width:100%">
                    <td colspan="2"><h3 style="font-style: italic;color:#e05d49;margin-top:-3px ;">${invoice.createdAt}</h3></td><td></td>
                  </tr>
                </table>
                <table style="font-family: GlacialIndifferenceRegular; width: 50%; margin:auto; padding:0 4%;">
                  <tr style="border-bottom:1px;">
                    <td style="border-bottom:1px;"><b>Description</b></td><td style="text-align: right;"><b>Subtotal</b></td>
                  </tr>
                  <tr><td colspan="2" style="width: 100%;"><hr style=" margin: auto; height: 1px;background:#d6d3ce;border: 1px #d6d3ce ;"></td><td></td></tr>
                  ${invoice_items}
                  <tr><td colspan="2" style="width: 100%;"><hr style=" margin: auto; height: 1px;background:#d6d3ce;border: 1px #d6d3ce ;"></td><td></td></tr>
                  <tr><td></td><td style="text-align: right;"><b>TOTAL:  </b> £${invoice.cost}</td></tr>
                </table>
                <table style="font-family: GlacialIndifferenceRegular; width: 50%; margin:auto;">
                  <tr>
                    <td colspan="2"; style="text-align: center;"><br><br><br>
                      <a href="${env.PRIVACY_POLICY}" style="font-size:12px; color: black; padding: 10px;">Privacy and policy</a> 
                      <a href="${env.TERMS_OF_SERVICE}" style="font-size:12px; color: black; padding: 10px;">Terms & Conditions</a> 
                      <a href="${env.FAQS}" style="font-size:12px; color: black; padding: 10px;">FAQ</a></td><td></td>
                  </tr>

                  
                </table>
                <table style="font-family: GlacialIndifferenceRegular; width: 50%; margin:auto; background-color: #d6d3ce; padding: 1%;">
                  <tr>
                    <td style="width: 50%; padding:2% 4%;"><img src="${env.FOOTER_LOGO}" width="150"></td>
                    
                    <td style="width: 50%;text-align: right;"><p style="font-size:12px;">${env.SUPPORT_EMAIL}<br>
                      ${env.CONTACT_NUMBER}<br>
                      ${env.PUBLIC_APP_URL}<br>
                      ${env.MAILING_ADDRESS}</p></td>
                  </tr>
                </table>

              </body>
              </html>
        `;

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
