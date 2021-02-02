import { HttpModule, Module } from '@nestjs/common';
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

import {LanguageModule} from './modules/language/language.module';
import {FactoryModule} from './factories/factories.module';
import { MainMysqlModule } from './shared/main-mysql.module';
import { ApiCallingModule } from './services/api-calling/api-calling.module';
import { PasswordHashModule } from './modules/password-hash/password-hash.module';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';


@Module({
  imports: [
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
    HttpModule,
    FactoryModule,
    ApiCallingModule,
    PasswordHashModule,
  ],
  controllers: [AppController, SeederController],
  providers: [
    ...SeederProviders,
    AccessControlService,
    AppLogger,
    AppService,
    CompressionInterceptor,
    PermissionsService,  
    
  ],
})
export class AppModule {}
