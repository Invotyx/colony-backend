import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ForgotPassword } from 'src/entities/forgottenpassword.entity';
import { ForgotPasswordRepository } from 'src/modules/users/repos/forgotpassword.repo';
import { AppConfig } from '../../configs/app.config';
import { MailBuilder, MailClient } from '../../services/mail/mail.service';
import { MarkDown } from '../../shared/marked';

@Injectable()
export class ForgotPasswordTokenSender {
  constructor(
    private readonly mailBuilder: MailBuilder,
    private readonly mailClient: MailClient,
    private readonly forgotPass: ForgotPasswordRepository,
  ) {}

  async sendEmail(model: ForgotPassword): Promise<boolean> {
    try {
      console.log('model: ', model);
      if (model && model.newPasswordToken) {
        const appConfig = await AppConfig();
        const markdownContent = [
          'You are receiving this email because we received a request for account creation.',
          `#### Click this link to verify your email`,
          `** ${
            process.env.PUBLIC_APP_URL +
            '/#/system/reset-password/' +
            model.newPasswordToken +
            '/' +
            model.email
          } **`,
          '---',
          'Best Regards,',
          `${appConfig.name} IT Team`,
        ].join('\n\n');
        const markdownHTML = await MarkDown(markdownContent);
        const htmlContent = await this.mailBuilder.build({
          content: markdownHTML,
        });
        const mail = await this.mailClient.send({
          to: { name: model.email, address: model.email },
          subject: 'Password Reset Request',
          html: htmlContent,
          text: markdownContent,
        });
        return mail;
      }
    } catch (ex) {
      throw new HttpException(
        'Mail server down, unable to send account verification email!',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
