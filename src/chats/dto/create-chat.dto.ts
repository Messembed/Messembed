import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsObject, IsOptional } from 'class-validator';

export class CreateChatDto {
  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  externalMetadata?: Record<string, any> | null;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsObject()
  @IsOptional()
  privateExternalMetadata?: Record<string, unknown>;

  @ApiProperty()
  @IsString()
  firstCompanionId: string;

  @ApiProperty()
  @IsString()
  secondCompanionId: string;
}
