import { errors } from '../constants/errors';
import { HttpException } from '@nestjs/common';

export type ErrorCode = keyof typeof errors;

export class ErrorGenerator {
  static create(
    code: ErrorCode,
    message?: string,
    additional: Record<string, unknown> = {},
  ): HttpException {
    const statusCode = errors[code] || 500;

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
