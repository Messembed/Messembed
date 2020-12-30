import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject } from '@nestjs/common';
import { JwtAuthTokenPayload } from '../interfaces/jwt-auth-token-payload.interface';
import { RequestAuthData } from '../classes/request-auth-data.class';
import { AuthConfigType, AUTH_CONFIG_KEY } from '../../config/auth.config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(AUTH_CONFIG_KEY)
    authConfig: AuthConfigType,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfig.jwtStrategy.jwtSecret,
    });
  }

  async validate(payload: JwtAuthTokenPayload): Promise<RequestAuthData> {
    const user = await this.usersService.findOneUserFromMongoOrFail(
      payload.sub,
    );

    return new RequestAuthData({
      user,
      externalService: null,
      isExternalService: false,
    });
  }
}
