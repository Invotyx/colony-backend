import { Module } from '@nestjs/common';
import { EmailTokenSender } from 'src/mails/users/emailtoken.mailer';
import { ForgotPasswordTokenSender } from 'src/mails/users/forgotpassword.mailer';
import { CityCountryModule } from 'src/services/city-country/city-country.module';
import { MailModule } from 'src/services/mail/mail.module';
import { MainMysqlModule } from '../../shared/main-mysql.module';
import { LanguageModule } from '../language/language.module';
import { SmsModule } from '../sms/sms.module';
import { RolesService } from './services/roles.service';
import { UsersService } from './services/users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [
    MainMysqlModule,
    LanguageModule,
    MailModule,
    CityCountryModule,
    SmsModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    RolesService,
    EmailTokenSender,
    ForgotPasswordTokenSender,
  ],
  exports: [UsersService, RolesService],
})
export class UsersModule {}
