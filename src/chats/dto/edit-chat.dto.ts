import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsObject, IsBoolean } from 'class-validator';

export class EditChatDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  externalMetadata?: Record<string, any>;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsObject()
  @IsOptional()
  privateExternalMetadata?: Record<string, unknown>;
}
