import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsObject,
  IsOptional,
  IsMongoId,
  IsArray,
} from 'class-validator';

export class CreateMessageThroughWebSocketDto {
  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsMongoId()
  chatId: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsObject()
  @IsOptional()
  externalMetadata: Record<string, unknown>;

  @ApiPropertyOptional({
    type: Object,
    isArray: true,
    additionalProperties: true,
  })
  @IsObject({ each: true })
  @IsArray()
  @IsOptional()
  attachments?: Record<string, unknown>[];
}
