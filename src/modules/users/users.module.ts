import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { MainMysqlModule } from '../../shared/main-mysql.module';
import { MailBuilder, MailClient } from '../../services/mail/mail.service';
import { RolesService } from './services/roles.service';
import { UsersService } from './services/users.service';
import { LanguageModule } from '../language/language.module';
import { MailModule } from 'src/services/mail/mail.module';
import { EmailTokenSender } from 'src/mails/users/emailtoken.mailer';
import { ForgotPasswordTokenSender } from 'src/mails/users/forgotpassword.mailer';

@Module({
  imports: [MainMysqlModule,LanguageModule,MailModule],
  controllers: [UsersController],
  providers: [UsersService, RolesService, EmailTokenSender,ForgotPasswordTokenSender],
  exports: [UsersService, RolesService],
})
export class UsersModule {}
