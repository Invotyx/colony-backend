import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { env } from 'process';
import { AppModule } from './app.module';
import { logger } from './services/logs/log.storage';
import { SeederModule } from './seeder/seeder.module';
import { SeederService } from './seeder/seeder.service';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';

async function bootstrap() {
  NestFactory.createApplicationContext(SeederModule)
    .then((appContext) => {
      const seeder = appContext.get(SeederService);
      seeder
        .sow({ klass: 'RolesSeed', up: true })
        .then(() => {
          console.log('Roles Seeding complete!');
        })
        .catch((error) => {
          console.log('Roles Seeding failed!');
          throw error;
        });

      seeder
        .sow({ klass: 'AddProductsSeed', up: true })
        .then(() => {
          console.log('Products seeds completed!');
        })
        .catch((error) => {
          console.log('Products seeds  failed!');
          throw error;
        });

      seeder
        .sow({ klass: 'CreateAdminSeed', up: true })
        .then(() => {
          console.log('user Seeding complete!');
        })
        .catch((error) => {
          console.log('User Seeding failed!');
          throw error;
        })
        .finally(() => {
          appContext.close();
        });
    })
    .catch((error) => {
      throw error;
    });

  const app = await NestFactory.create(AppModule, { ...logger, cors: true });

  const config = new DocumentBuilder()
    .setTitle('Colony API')
    .setDescription('Colony API Docs')
    .addServer('/api')
    .addBearerAuth()
    .setVersion('1.0')
    .addTag('colony')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = env.port || '4000';
  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      transform: true,
      exceptionFactory: (errors) => {
        let _e = [];
        
        errors.forEach((error, i) => {
          _e.push({
            [error.property]: error.constraints,
          });
        }); 
        return new HttpException(
          {
            errors: _e,
            message: 'Unprocessable entity',
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      },
    }),
  );
  await app.listen(port, () => {
    console.log(
      'Listening API at http://localhost:' + port + '/' + globalPrefix,
    );
  });
}

bootstrap();
