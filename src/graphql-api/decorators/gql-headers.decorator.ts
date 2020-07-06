import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IncomingMessage } from 'http';

export const GqlHeaders = createParamDecorator(
  (headerName: string | void, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request: IncomingMessage = ctx.getContext().req;

    if (headerName) {
      return request.headers[headerName.toLowerCase()];
    }

    return request.headers;
  },
);
