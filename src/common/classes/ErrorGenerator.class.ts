import { errors } from '../constants/errors';
import { HttpException } from '@nestjs/common';

export type ErrorCode = keyof typeof errors;

export class ErrorGenerator {
  static create(
    code: ErrorCode,
    additional: Record<string, unknown> = {},
  ): HttpException {
    const statusCode = errors[code];

    return new HttpException(
      {
        statusCode,
        code,
        ...additional,
      },
      statusCode,
    );
  }
}
