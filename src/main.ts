import { ModuleRef, NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { env } from 'process';
import { AppModule } from './app.module';
import { logger } from './services/logs/log.storage';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { ...logger,cors: true  });
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
  await app.listen(port, () => {
    console.log(
      'Listening API at http://localhost:' + port + '/' + globalPrefix
    );
  });


}


bootstrap();
