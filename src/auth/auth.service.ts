import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { AccessTokenDto } from './dto/access-token.dto';
import { JwtAuthTokenPayload } from './interfaces/jwt-auth-token-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from '../users/repositories/users.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersRepo: UsersRepository,
  ) {}

  async createAccessTokenByUserId(userId: string): Promise<AccessTokenDto> {
    const user = await this.usersRepo.findOneOrFailHttp({ id: userId });

    return this.createAccessToken(user);
  }

  async createAccessToken(user: User): Promise<AccessTokenDto> {
    const payload: JwtAuthTokenPayload = {
      sub: user.id,
    };

    return new AccessTokenDto({
      accessToken: await this.jwtService.signAsync(payload),
    });
  }
}
