import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

/**
 * @example
 * // ChatPath.dto.ts
 * class ChatPathDto {
 *  ()ResourcePathIdParam({ description: 'ID чата' })
 *  chatId: integer
 * }
 *
 * // chats.controller.ts
 * class ChatsController {
 *  ()Get('/chats/:chatId')
 *  async get({ chatId }: ChatPathDto) { return ... }
 * }
 */
export function ResourcePathIdParam(
  options?: ApiPropertyOptions,
): PropertyDecorator {
  return applyDecorators(
    ApiProperty(options),
    Type(() => Number),
    IsInt(),
  );
}
