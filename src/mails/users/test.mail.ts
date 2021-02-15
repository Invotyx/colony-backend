import { Injectable } from '@nestjs/common';
import { AppConfig } from '../../configs/app.config';
import { UserEntity } from '../../entities/user.entity';
import { MailBuilder, MailClient } from '../../services/mail/mail.service';
import { MarkDown } from '../../shared/marked';

@Injectable()
export class TestMailer {
  constructor(
    private readonly mailBuilder: MailBuilder,
    private readonly mailClient: MailClient,
  ) {}

  async setTestEmail(user: UserEntity, data: any) {
    const appConfig = await AppConfig();
    const markdownContent = [
      'This is test email.',
      `#### **${data}**`,
      'If you did not request this, no further action is required.',
      '---',
      'Best Regards,',
      `${appConfig.name} Team`,
    ].join('\n\n');
    const markdownHTML = await MarkDown(markdownContent);
    const htmlContent = await this.mailBuilder.build({ content: markdownHTML });

    await this.mailClient.send({
      to: { name: user.name, address: user.email },
      subject: 'Password Reset Request',
      html: htmlContent,
      text: markdownContent,
    });
    return data;
  }
}
