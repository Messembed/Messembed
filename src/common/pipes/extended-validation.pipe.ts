import {
  PipeTransform,
  Injectable,
  Scope,
  Inject,
  ValidationPipe,
  ValidationPipeOptions,
  Type,
  ArgumentMetadata,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

export function ExtendedValidationPipe<R = Request>(
  validatorOptions?: ValidationPipeOptions,
  groupsResolver?: (req: R) => string[],
): Type<PipeTransform> {
  class MixinExtendedValidationPipe extends ValidationPipe {
    constructor(@Inject(REQUEST) private request: R) {
      super(validatorOptions);
    }

    transform(value: any, metadata: ArgumentMetadata): Promise<any> {
      const groups = groupsResolver ? groupsResolver(this.request) : undefined;

      this.validatorOptions = Object.assign(this.validatorOptions || {}, {
        groups,
      });

      this.transformOptions = Object.assign(this.transformOptions || {}, {
        groups,
      });

      return super.transform(value, metadata);
    }
  }

  Injectable({ scope: Scope.REQUEST })(MixinExtendedValidationPipe);

  return MixinExtendedValidationPipe;
}
