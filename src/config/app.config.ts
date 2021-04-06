import { registerAs, ConfigType } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  host: process.env.HOST,
  port: +process.env.PORT,
  disallowUsersToCreateChats:
    process.env.DISALLOW_USERS_TO_CREATE_CHATS === 'true',
}));

export const APP_CONFIG_KEY = appConfig.KEY;

export type AppConfigType = ConfigType<typeof appConfig>;
