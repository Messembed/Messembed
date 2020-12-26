import {
  IsString,
  IsObject,
  IsOptional,
  IsEmpty,
  IsMongoId,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ValidationGroup } from '../../common/constants/validation-group.enum';

export class CreateMessageInMongoDto {
  @ApiProperty()
  @IsMongoId({ groups: [ValidationGroup.EXT_SER] })
  @IsEmpty({ groups: [ValidationGroup.USER] })
  userId: string;

  @ApiProperty()
  @IsString({ groups: [ValidationGroup.ALL] })
  content: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsObject({ groups: [ValidationGroup.ALL] })
  @IsOptional({ groups: [ValidationGroup.ALL] })
  externalMetadata: Record<string, unknown>;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsObject({ groups: [ValidationGroup.EXT_SER] })
  @IsOptional({ groups: [ValidationGroup.EXT_SER] })
  @IsEmpty({ groups: [ValidationGroup.USER] })
  privateExternalMetadata?: Record<string, unknown>;
}
