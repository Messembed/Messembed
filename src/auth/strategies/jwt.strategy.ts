import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject } from '@nestjs/common';
import { JwtAuthTokenPayload } from '../interfaces/jwt-auth-token-payload.interface';
import { RequestAuthData } from '../classes/request-auth-data.class';
import { UsersRepository } from '../../users/repositories/users.repository';
import { AuthConfigType, AUTH_CONFIG_KEY } from '../../config/auth.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(AUTH_CONFIG_KEY)
    authConfig: AuthConfigType,
    private readonly usersRepo: UsersRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfig.jwtStrategy.jwtSecret,
    });
  }

  async validate(payload: JwtAuthTokenPayload): Promise<RequestAuthData> {
    const user = await this.usersRepo.findOneOrFail(payload.sub);

    return new RequestAuthData({
      user,
      externalService: null,
      isExternalService: false,
    });
  }
}
