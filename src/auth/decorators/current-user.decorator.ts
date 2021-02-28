import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserMongoDocument } from '../../users/schemas/user.schema';

export const CurrentUser = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();

    const currentUser = req['user'] as UserMongoDocument;

    return currentUser;
  },
);
