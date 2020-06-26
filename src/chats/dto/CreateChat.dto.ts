import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, Length, IsInt, IsObject, IsOptional } from 'class-validator';

export class CreateChatDto {
  @ApiProperty()
  @IsString()
  @Length(1, 100)
  title: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  externalMetadata?: Record<string, any> | null;

  @ApiProperty()
  @IsInt()
  initiatorId: number;

  @ApiProperty()
  @IsInt()
  companionId: number;
}
