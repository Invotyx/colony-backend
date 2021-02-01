import { Injectable } from '@nestjs/common';
import { AppConfig } from '../../configs/app.config';
import { UserEntity } from '../../entities/user.entity';
import { MailBuilder, MailClient } from '../../services/mail/mail.service';
import { MarkDown } from '../../shared/marked';

@Injectable()
export class AuthMailer {
  constructor(
    private readonly mailBuilder: MailBuilder,
    private readonly mailClient: MailClient,
  ) {}

  async setForgetPasswordMail(user: UserEntity, token: number | string) {
    const appConfig = await AppConfig();
    const markdownContent = [
      'You are receiving this email because we received a password reset request for your account.',
      `#### Reset Password Token is **${token}**`,
      'If you did not request a password reset, no further action is required.',
      '---',
      'Best Regards,',
      `${appConfig.name} IT Team`,
    ].join('\n\n');
    const markdownHTML = await MarkDown(markdownContent);
    const htmlContent = await this.mailBuilder.build({ content: markdownHTML });
    const mail = await this.mailClient.send({
      to: { name: user.name, address: user.email },
      subject: 'Password Reset Request',
      html: htmlContent,
      text: markdownContent,
    });
    return token;
  }


}
