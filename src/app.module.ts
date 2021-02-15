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

import { LanguageModule } from './modules/language/language.module';
import { MainMysqlModule } from './shared/main-mysql.module';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ContentModule } from './modules/content/content.module';
import { ProductsModule } from './modules/products/products.module';

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
    ContentModule,
    ProductsModule,
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
