import { IsBoolean, IsDate, IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { TransformInt } from '../../common/utils/transform-int.util';

export class GetMessagesFiltersDto {
  @ApiPropertyOptional()
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  after?: Date;

  @ApiPropertyOptional()
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  before?: Date;

  @ApiPropertyOptional()
  @Transform(TransformInt)
  @IsInt()
  @IsOptional()
  offset?: number;

  @ApiPropertyOptional()
  @Transform(TransformInt)
  @IsInt()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional()
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  read?: boolean;
}
