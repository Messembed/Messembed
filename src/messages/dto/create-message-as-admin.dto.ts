import { IsObject, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMessageAsAdminDto {
  @ApiProperty()
  @IsMongoId()
  userId: string;

  @ApiProperty()
  content: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsObject()
  @IsOptional()
  externalMetadata: Record<string, unknown>;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsObject()
  @IsOptional()
  privateExternalMetadata?: Record<string, unknown>;
}
