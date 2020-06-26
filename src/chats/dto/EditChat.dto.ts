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
  additionalMetadata?: Record<string, any> | null;
}
