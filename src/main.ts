import { HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import * as mtz from 'moment-timezone';
import { env } from 'process';
import { AppModule } from './app.module';
import { SeederModule } from './seeder/seeder.module';
import { SeederService } from './seeder/seeder.service';
import { logger } from './services/logs/log.storage';

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
        .sow({ klass: 'PlanSeed', up: true })
        .then(() => {
          console.log('Plan Seeding complete!');
        })
        .catch((error) => {
          console.log('Plan Seeding failed!');
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
  mtz.tz.setDefault('UTC');
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
  const port = env.port || 4000;
  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      transform: true,
      exceptionFactory: (errors) => {
        errors = Object.assign(
          {},
          ...errors.map((item) => ({ [item.property]: item.constraints })),
        );
        console.log(errors);
        return new HttpException(
          {
            errors: errors,
            message: 'Unprocessable entity',
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      },
    }),
  );

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.enableCors({ origin: '*' });
  await app.listen(port, () => {
    logger.info('test');
    logger.error('error');
    console.log(
      'Listening API at http://localhost:' + port + '/' + globalPrefix,
    );
  });
}

bootstrap();
