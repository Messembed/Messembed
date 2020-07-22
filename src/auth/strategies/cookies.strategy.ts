import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import express, { Request } from 'express';
import { RequestAuthData } from '../classes/request-auth-data.class';
import axios from 'axios';
import { UsersRepository } from '../../users/repositories/users.repository';
import { Injectable, Inject } from '@nestjs/common';
import { AuthConfigType, AUTH_CONFIG_KEY } from '../../config/auth.config';
import { ExternalServiceService } from '../../external-service/external-service.service';
import { User } from '../../users/entities/user.entity';
import { EventName } from '../../external-service/constants/event-name.enum';

@Injectable()
export class CookiesStrategy extends PassportStrategy(Strategy, 'cookies') {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly externalServiceService: ExternalServiceService,
    @Inject(AUTH_CONFIG_KEY)
    private readonly authConfig: AuthConfigType,
  ) {
    super();
  }

  async validate(req: express.Request): Promise<RequestAuthData> {
    if (!this.authConfig.cookiesStrategy.verifyUrl) {
      throw new Error('URL for verifying cookies is not present');
    }

    if (!req.headers.cookie) {
      throw new Error('Cookie header is not present in the request');
    }

    const user = await this.getUser(req);

    return new RequestAuthData({
      user,
      externalService: null,
      isExternalService: false,
    });
  }

  async getUser(req: Request): Promise<User> {
    const { data: profile } = await axios.get(
      this.authConfig.cookiesStrategy.verifyUrl,
      {
        headers: {
          cookie: req.headers.cookie,
        },
      },
    );

    const userId = profile.id;

    let user = await this.usersRepo.findOne(userId);

    if (!user) {
      await this.externalServiceService.sendEvent({
        name: EventName.USER_NOT_SYNCED,
        data: {
          userId,
        },
      });

      user = await this.usersRepo.findOneOrFail(userId);
    }

    return user;
  }
}
