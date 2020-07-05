import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { transformJson } from '../../common/utils/transform-json.util';

export class ChatsQueryDto {
  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @Transform(transformJson)
  @IsObject()
  @IsOptional()
  externalMetadata?: Record<string, unknown>;
}
