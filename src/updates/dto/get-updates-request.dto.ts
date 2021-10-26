import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';

export class GetUpdatesRequestDto {
  @ApiProperty({
    type: String,
    description:
      'Creation date of last fetched update (the `createdAt` field of the last update).',
  })
  @Type(() => Date)
  @IsDate()
  creationDateOfLastFetchedUpdate: Date;
}
