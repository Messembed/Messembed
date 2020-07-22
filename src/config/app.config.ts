import { registerAs, ConfigType } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  appUrl: process.env.APP_URL,
  externalServiceCallbackUrl: process.env.EXTERNAL_SERVICE_CALLBACK_URL,
  host: process.env.HOST,
  port: +process.env.PORT,
}));

export const APP_CONFIG_KEY = appConfig.KEY;

export type AppConfigType = ConfigType<typeof appConfig>;
