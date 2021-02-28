import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy } from 'passport-http';
import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import secureCompare from 'secure-compare';
import { AuthConfigType, AUTH_CONFIG_KEY } from '../../config/auth.config';
import { Admin } from '../classes/admin.class';

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

  async validate(username: string, password: string): Promise<Admin> {
    if (!secureCompare(password, this.authConfig.externalService.password)) {
      throw new UnauthorizedException();
    }

    return new Admin();
  }
}
