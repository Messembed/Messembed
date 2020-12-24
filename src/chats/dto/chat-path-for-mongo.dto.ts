import { ValidationGroup } from '../../common/constants/validation-group.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class ChatPathForMongoDto {
  @ApiProperty({ description: 'ID чата' })
  @IsMongoId({ groups: [ValidationGroup.ALL] })
  chatId: string;
}
