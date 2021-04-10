import { IsString, IsObject, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty()
  @IsString()
  content: string;

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
