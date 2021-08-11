import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AppConfig } from '../../configs/app.config';
import { EmailVerificationsRepository } from '../../modules/users/repos/verifyemail.repo';
import { MailBuilder, MailClient } from '../../services/mail/mail.service';
import { MarkDown } from '../../shared/marked';

@Injectable()
export class EmailTokenSender {
  constructor(
    private readonly mailBuilder: MailBuilder,
    private readonly mailClient: MailClient,
    private readonly emailVerif: EmailVerificationsRepository,
  ) {}

  async sendEmailVerification(email: string): Promise<boolean> {
    try {
      const model = await this.emailVerif.findOne({ where: { email: email } });

      if (model && model.emailToken) {
        const appConfig = await AppConfig();
        const markdownContent = [
          'You are receiving this email because we received a request for account creation.',
          `#### Click this link to verify your email`,
          `** ${
            process.env.PUBLIC_APP_URL + '/email/verify/' + model.emailToken
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
          subject: 'Email Verification Request',
          html: htmlContent,
          text: markdownContent,
        });
        ////console.log('Mail sent');
        return mail;
      }
    } catch (ex) {
      throw new HttpException(ex, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
