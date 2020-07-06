import { ApiProperty } from '@nestjs/swagger';

export class AccessTokenDto {
  @ApiProperty()
  accessToken: string;

  constructor(fields: Partial<AccessTokenDto>) {
    Object.assign(this, fields);
  }
}
