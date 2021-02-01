import { Module } from '@nestjs/common';
import { MailBuilder, MailClient } from './mail.service';

@Module({
  controllers: [],
  imports: [],
  providers: [MailBuilder, MailClient],
  exports: [MailBuilder, MailClient],
})
export class MailModule {}
