import { registerAs, ConfigType } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
}));

export const JWT_CONFIG_KEY = jwtConfig.KEY;

export type JwtConfigType = ConfigType<typeof jwtConfig>;
