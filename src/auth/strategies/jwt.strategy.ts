import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject } from '@nestjs/common';
import { JwtAuthTokenPayload } from '../interfaces/jwt-auth-token-payload.interface';
import { AuthConfigType, AUTH_CONFIG_KEY } from '../../config/auth.config';
import { UsersService } from '../../users/users.service';
import { UserDocument } from '../../users/schemas/user.schema';

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

  async validate(payload: JwtAuthTokenPayload): Promise<UserDocument> {
    const user = await this.usersService.getUserByIdOrFail(payload.sub);

    return user;
  }
}
