import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { ContentModule } from './modules/content/content.module';
import { InfluencerLinksModule } from './modules/influencer-links/influencer-links.module';
import { KeywordsModule } from './modules/keywords/keywords.module';
import { LanguageModule } from './modules/language/language.module';
import { PaymentHistoryModule } from './modules/payment-history/payment-history.module';
import { PhoneModule } from './modules/phone/phone.module';
import { ProductsModule } from './modules/products/products.module';
import { ShareableLinkHandlerModule } from './modules/shareable-link-handler/shareable-link-handler.module';
import { SmsModule } from './modules/sms/sms.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { PermissionsService } from './modules/users/services/permissions.service';
import { UsersModule } from './modules/users/users.module';
import { SeederController } from './seeder/seeder.controller';
import { SeederProviders } from './seeder/seeder.module';
import { AccessControlService } from './services/access-control/access-control.service';
import { ApiCallingModule } from './services/api-calling/api-calling.module';
import { CityCountryController } from './services/city-country/city-country.controller';
import { CityCountryModule } from './services/city-country/city-country.module';
import { CityCountryService } from './services/city-country/city-country.service';
import { CompressionInterceptor } from './services/common/compression/compression.interceptor';
import { AppLogger } from './services/logs/log.service';
import { MailModule } from './services/mail/mail.module';
import { MainMysqlModule } from './shared/main-mysql.module';
import { SupportModule } from './modules/support/support.module';
import { TwilioModule } from './modules/twilio/twilio.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MulterModule.register({
      dest: './uploads',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      exclude: ['/api*'],
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: 6379,
      },
    }),
    AuthModule,
    UsersModule,
    MailModule,
    MainMysqlModule,
    LanguageModule,
    ContentModule,
    ProductsModule,
    TasksModule,
    ApiCallingModule,
    SmsModule,
    PhoneModule,
    CityCountryModule,
    ContactsModule,
    InfluencerLinksModule,
    PaymentHistoryModule,
    ShareableLinkHandlerModule,
    KeywordsModule,
    CloudinaryModule,
    SupportModule,
    TwilioModule,
  ],
  controllers: [AppController, SeederController, CityCountryController],
  providers: [
    ...SeederProviders,
    AccessControlService,
    AppLogger,
    AppService,
    CompressionInterceptor,
    PermissionsService,
    CityCountryService,
  ],
})
export class AppModule {}
