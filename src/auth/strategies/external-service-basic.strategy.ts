import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy } from 'passport-http';
import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { RequestAuthData } from '../classes/request-auth-data.class';
import {
  EXTERNAL_SERVICE_CONFIG_KEY,
  ExternalServiceConfigType,
} from '../../config/external-service.config';
import secureCompare from 'secure-compare';

@Injectable()
export class ExternalServiceBasicStrategy extends PassportStrategy(
  BasicStrategy,
  'external-service-basic',
) {
  constructor(
    @Inject(EXTERNAL_SERVICE_CONFIG_KEY)
    private readonly externalServiceConfig: ExternalServiceConfigType,
  ) {
    super();
  }

  async validate(username: string, password: string): Promise<RequestAuthData> {
    if (!secureCompare(password, this.externalServiceConfig.password)) {
      throw new UnauthorizedException();
    }

    return new RequestAuthData({
      externalService: username || null,
      isExternalService: true,
      user: null,
    });
  }
}
