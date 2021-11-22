import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { transformJson } from '../../common/utils/transform-json.util';

export class GetUnreadChatsCountQueryDto {
  @ApiPropertyOptional({
    type: Boolean,
    default: false,
    description: 'Set to true to get also chats with `active: false`',
  })
  @Transform(transformJson)
  @IsBoolean()
  @IsOptional()
  includeInactive?: boolean;
}
