import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, Length, IsObject, IsOptional, IsIn } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @Length(1)
  id: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsObject()
  @IsOptional()
  externalMetadata?: Record<string, unknown>;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsObject()
  @IsOptional()
  privateExternalMetadata?: Record<string, unknown>;

  @ApiPropertyOptional({
    type: String,
    enum: ['CANT_SEND_AND_RECEIVE_NEW_MESSAGES'],
  })
  @IsString()
  @IsIn(['CANT_SEND_AND_RECEIVE_NEW_MESSAGES'])
  @IsOptional()
  blockStatus?: 'CANT_SEND_AND_RECEIVE_NEW_MESSAGES' | null;
}
