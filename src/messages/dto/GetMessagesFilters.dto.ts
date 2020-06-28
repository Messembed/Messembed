import { IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { TransformInt } from '../../common/utils/TransformInt.util';

export class GetMessagesFiltersDto {
  @ApiPropertyOptional()
  @Transform(TransformInt)
  @IsInt()
  @IsOptional()
  afterId?: number;

  @ApiPropertyOptional()
  @Transform(TransformInt)
  @IsInt()
  @IsOptional()
  beforeId?: number;

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
}
