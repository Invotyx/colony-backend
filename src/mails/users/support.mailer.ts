import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { AppConfig } from '../../configs/app.config';
import { MailClient } from '../../services/mail/mail.service';

@Injectable()
export class SupportEmailSender {
  constructor(private readonly mailClient: MailClient) {}

  async sendEmail(model: UserEntity, subject, body): Promise<boolean> {
    try {
      //console.log('model: ', model);
      if (model && model.newPasswordToken) {
        const appConfig = await AppConfig();

        const html = body;

        const mail = await this.mailClient.send({
          to: {
            name: model.firstName + ' ' + model.lastName,
            address: model.email,
          },
          subject: subject,
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
