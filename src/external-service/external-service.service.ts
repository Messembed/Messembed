import { Injectable, Inject } from '@nestjs/common';
import { EventPayload } from './interfaces/event-payload.interface';
import { AppConfigType, APP_CONFIG_KEY } from '../config/app.config';
import axios, { AxiosInstance } from 'axios';
import { AuthConfigType, AUTH_CONFIG_KEY } from '../config/auth.config';
import { CallbackType } from './constants/callback-type.enum';
import { CallbackPayload } from './interfaces/callback-payload.interface';

@Injectable()
export class ExternalServiceService {
  private readonly axios: AxiosInstance;

  constructor(
    @Inject(APP_CONFIG_KEY)
    private readonly appConfig: AppConfigType,
    @Inject(AUTH_CONFIG_KEY)
    private readonly authConfig: AuthConfigType,
  ) {
    this.axios = axios.create();
  }

  async sendCallback<TResult = any>(
    payload: CallbackPayload,
  ): Promise<TResult> {
    const response = await axios.post<TResult>(
      this.appConfig.externalServiceCallbackUrl,
      payload,
      {
        auth: {
          username: 'labado-messenger',
          password: this.authConfig.externalService.password,
        },
      },
    );

    return response.data;
  }

  async sendEvent(payload: EventPayload): Promise<void> {
    await this.sendCallback({
      type: CallbackType.EVENT,
      data: payload,
    });
  }
}
