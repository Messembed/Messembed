import {
  IsObject,
  IsOptional,
  IsMongoId,
  IsArray,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMessageAsAdminDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsObject()
  @IsOptional()
  externalMetadata: Record<string, unknown>;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsObject()
  @IsOptional()
  privateExternalMetadata?: Record<string, unknown>;

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
