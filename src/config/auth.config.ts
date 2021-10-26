import { registerAs, ConfigType } from '@nestjs/config';

export const authConfig = registerAs('auth', () => ({
  externalService: {
    password: process.env.AUTH__EXTERNAL_SERVICE__PASSWORD,
  },
  jwtStrategy: {
    jwtSecret: process.env.AUTH__JWT_STRATEGY__JWT_SECRET,
  },
}));

export const AUTH_CONFIG_KEY = authConfig.KEY;

export type AuthConfigType = ConfigType<typeof authConfig>;
