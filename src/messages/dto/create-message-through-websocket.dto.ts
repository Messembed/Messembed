import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsObject,
  IsOptional,
  IsEmpty,
  IsMongoId,
} from 'class-validator';
import { ValidationGroup } from '../../common/constants/validation-group.enum';

export class CreateMessageThroughWebSocketDto {
  @ApiProperty()
  @IsString({ groups: [ValidationGroup.ALL] })
  content: string;

  @ApiProperty()
  @IsMongoId({ groups: [ValidationGroup.ALL] })
  chatId: string;

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
