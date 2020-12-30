import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import express, { Request } from 'express';
import { RequestAuthData } from '../classes/request-auth-data.class';
import axios from 'axios';
import { Injectable, Inject } from '@nestjs/common';
import { AuthConfigType, AUTH_CONFIG_KEY } from '../../config/auth.config';
import { ExternalServiceService } from '../../external-service/external-service.service';
import { EventName } from '../../external-service/constants/event-name.enum';
import { UsersService } from '../../users/users.service';
import { UserMongoDocument } from '../../users/schemas/user.schema';

@Injectable()
export class CookiesStrategy extends PassportStrategy(Strategy, 'cookies') {
  constructor(
    private readonly externalServiceService: ExternalServiceService,
    @Inject(AUTH_CONFIG_KEY)
    private readonly authConfig: AuthConfigType,
    private readonly usersService: UsersService,
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

    const user = await this.getUserFromMongo(req);

    return new RequestAuthData({
      user,
      externalService: null,
      isExternalService: false,
    });
  }

  private async getUserFromMongo(req: Request): Promise<UserMongoDocument> {
    const { data: profile } = await axios.get(
      this.authConfig.cookiesStrategy.verifyUrl,
      {
        headers: {
          cookie: req.headers.cookie,
        },
      },
    );

    const userId = profile.id;

    let user = await this.usersService.findOneUserByExternalId(userId);

    if (!user) {
      await this.externalServiceService.sendEvent({
        name: EventName.USER_NOT_SYNCED,
        data: {
          userId,
        },
      });

      user = await this.usersService.findOneUserByExternalIdFromMongoOrFail(
        userId,
      );
    }

    return user;
  }
}
