import { ConfigModuleOptions } from '@nestjs/config/dist/interfaces';
import { appConfig } from './app.config';
import Joi from '@hapi/joi';
import { authConfig } from './auth.config';

export const configModuleOptions: ConfigModuleOptions = {
  isGlobal: true,
  validationSchema: Joi.object({
    PORT: Joi.number()
      .port()
      .required(),
    HOST: Joi.string().required(),
    APP_URL: Joi.string().required(),
    AUTH__EXTERNAL_SERVICE__PASSWORD: Joi.string().optional(),
    AUTH__COOKIES_STRATEGY__VERIFY_URL: Joi.string().optional(),
    AUTH__JWT_STRATEGY__JWT_SECRET: Joi.string().optional(),
  }),
  load: [appConfig, authConfig],
};
