import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SeederController } from './seeder/seeder.controller';
import { SeederProviders } from './seeder/seeder.module';
import { AccessControlService } from './services/access-control/access-control.service';
import { AuthModule } from './modules/auth/auth.module';
import { CompressionInterceptor } from './services/common/compression/compression.interceptor';
import { AppLogger } from './services/logs/log.service';
import { MailModule } from './services/mail/mail.module';
import { PermissionsService } from './modules/users/services/permissions.service';
import { ScheduleModule } from '@nestjs/schedule';
import { LanguageModule } from './modules/language/language.module';
import { MainMysqlModule } from './shared/main-mysql.module';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ContentModule } from './modules/content/content.module';
import { ProductsModule } from './modules/products/products.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { SmsModule } from './modules/sms/sms.module';
import { PhoneModule } from './modules/phone/phone.module';
import { ApiCallingModule } from './services/api-calling/api-calling.module';
import { CityCountryModule } from './services/city-country/city-country.module';
import { CityCountryService } from './services/city-country/city-country.service';
import { CityCountryController } from './services/city-country/city-country.controller';
import { ContactsModule } from './modules/contacts/contacts.module';

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
    AuthModule,
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
    ContactsModule
  ],
  controllers: [AppController, SeederController,CityCountryController],
  providers: [
    ...SeederProviders,
    AccessControlService,
    AppLogger,
    AppService,
    CompressionInterceptor,
    PermissionsService,
    CityCountryService
  ],
})
export class AppModule {}
