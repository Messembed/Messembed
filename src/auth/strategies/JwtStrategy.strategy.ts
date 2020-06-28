import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject } from '@nestjs/common';
import { JwtConfigType, JWT_CONFIG_KEY } from '../../config/jwt.config';
import { JwtAuthTokenPayload } from '../interfaces/JwtAuthTokenPayload.interface';
import { RequestAuthData } from '../classes/RequestAuthData.class';
import { UsersRepository } from '../../users/repositories/Users.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(JWT_CONFIG_KEY)
    jwtConfig: JwtConfigType,
    private readonly usersRepo: UsersRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
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