import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsObject } from 'class-validator';

export class EditChatDto {
  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  externalMetadata?: Record<string, any>;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsObject()
  @IsOptional()
  privateExternalMetadata?: Record<string, unknown>;
}
