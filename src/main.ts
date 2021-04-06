import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { setupSwagger } from './lib/setup-swagger';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = app.get(Logger);

  app.useLogger(logger);
  setupSwagger(app);

  const configServer = app.get(ConfigService);

  const PORT = configServer.get('PORT');
  const HOST = configServer.get('HOST');

  app.enableCors();

  await app.listen(PORT, HOST);
  logger.log(`Server is listening on http://${HOST}:${PORT}`);
}

bootstrap().catch(err => {
  console.error(err);
  process.exit(1);
});
