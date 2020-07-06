import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, Length, IsObject, IsOptional } from 'class-validator';

export class CreateChatDto {
  @ApiProperty()
  @IsString()
  @Length(1, 100)
  title: string;

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
