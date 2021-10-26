import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString } from 'class-validator';

export class UserPathDto {
  @ApiProperty({ description: 'ID пользователя' })
  @Type(() => String)
  @IsString()
  userId: string;
}
