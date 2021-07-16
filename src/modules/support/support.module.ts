import { Module } from '@nestjs/common';
import { SupportEmailSender } from '../../mails/users/support.mailer';
import { MailModule } from '../../services/mail/mail.module';
import { UsersModule } from '../users/users.module';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';

@Module({
  imports: [UsersModule, MailModule],
  controllers: [SupportController],
  providers: [SupportService, SupportEmailSender],
})
export class SupportModule {}
