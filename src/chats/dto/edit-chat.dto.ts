import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, IsObject } from 'class-validator';

export class EditChatDto {
  @ApiPropertyOptional()
  @IsString()
  @Length(1, 100)
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  externalMetadata?: Record<string, any>;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsObject()
  @IsOptional()
  privateExternalMetadata?: Record<string, unknown>;
}
