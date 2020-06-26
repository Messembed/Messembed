import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, Length, IsObject, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @Length(1)
  externalId: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsObject()
  @IsOptional()
  externalMetadata?: Record<string, unknown>;
}
