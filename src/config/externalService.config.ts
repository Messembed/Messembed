import { registerAs, ConfigType } from '@nestjs/config';

export const externalServiceConfig = registerAs('externalService', () => ({
  password: process.env.PASSWORD_FOR_SERVICE_ACCESS,
}));

export const EXTERNAL_SERVICE_CONFIG_KEY = externalServiceConfig.KEY;

export type ExternalServiceConfigType = ConfigType<
  typeof externalServiceConfig
>;
