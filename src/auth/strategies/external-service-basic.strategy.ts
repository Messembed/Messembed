import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy } from 'passport-http';
import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { RequestAuthData } from '../classes/request-auth-data.class';
import secureCompare from 'secure-compare';
import { AuthConfigType, AUTH_CONFIG_KEY } from '../../config/auth.config';

@Injectable()
export class ExternalServiceBasicStrategy extends PassportStrategy(
  BasicStrategy,
  'external-service-basic',
) {
  constructor(
    @Inject(AUTH_CONFIG_KEY)
    private readonly authConfig: AuthConfigType,
  ) {
    super();
  }

  async validate(username: string, password: string): Promise<RequestAuthData> {
    if (!secureCompare(password, this.authConfig.externalService.password)) {
      throw new UnauthorizedException();
    }

    return new RequestAuthData({
      externalService: username || null,
      isExternalService: true,
      user: null,
    });
  }
}
