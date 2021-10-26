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
    HOST: Joi.string()
      .optional()
      .default('127.0.0.1'),

    AUTH__EXTERNAL_SERVICE__PASSWORD: Joi.string().required(),
    AUTH__JWT_STRATEGY__JWT_SECRET: Joi.string().required(),

    MONGODB_URI: Joi.string()
      .uri()
      .required(),
  }),
  load: [appConfig, authConfig, mongodbConfig],
};
