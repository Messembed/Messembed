import { ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ErrorGenerator } from '../classes/error-generator.class';

export function createValidationPipe(): ValidationPipe {
  const validationPipe = new ValidationPipe({
    whitelist: true,
    transform: true,
    exceptionFactory(errors: ValidationError[]): any {
      return ErrorGenerator.create(
        'INVALID_INPUT',
        'Check parameters of your request',
        {
          validationErrors: validationPipe['flattenValidationErrors'](errors),
        },
      );
    },
  });

  return validationPipe;
}
