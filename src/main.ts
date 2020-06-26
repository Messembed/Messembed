import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { setupSwagger } from './lib/setup-swagger';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { initializeTransactionalContext } from 'typeorm-transactional-cls-hooked';

const logger = new Logger('bootstrap');

async function bootstrap() {
  initializeTransactionalContext();

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  setupSwagger(app);

  const configServer = app.get(ConfigService);

  const PORT = configServer.get('PORT');
  const HOST = configServer.get('HOST');

  await app.listen(PORT, HOST);
  logger.log(`Server is listening on http://${HOST}:${PORT}`);
}
bootstrap();
