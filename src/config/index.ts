import { ConfigModuleOptions } from '@nestjs/config/dist/interfaces';
import { appConfig } from './app.config';
import Joi from '@hapi/joi';
import { authConfig } from './auth.config';
import { mongodbConfig } from './mongodb.config';

export const configModuleOptions: ConfigModuleOptions = {
  isGlobal: true,
  validationSchema: Joi.object({
    PORT: Joi.number()
      .port()
      .required(),
    HOST: Joi.string().required(),
    APP_URL: Joi.string().required(),

    EXTERNAL_SERVICE_CALLBACK_URL: Joi.string()
      .uri()
      .required(),

    AUTH__EXTERNAL_SERVICE__PASSWORD: Joi.string().optional(),
    AUTH__COOKIES_STRATEGY__VERIFY_URL: Joi.string().optional(),
    AUTH__JWT_STRATEGY__JWT_SECRET: Joi.string().optional(),

    MONGODB_URI: Joi.string().uri().required(),
  }),
  load: [appConfig, authConfig, mongodbConfig],
};
