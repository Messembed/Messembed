import { ConfigModuleOptions } from '@nestjs/config/dist/interfaces';
import { jwtConfig } from './jwt.config';
import { externalServiceConfig } from './external-service.config';

export const configModuleOptions: ConfigModuleOptions = {
  isGlobal: true,
  load: [jwtConfig, externalServiceConfig],
};
