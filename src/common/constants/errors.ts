import { HttpStatus } from '@nestjs/common';

export const errors = {
  CHAT_NOT_FOUND: HttpStatus.NOT_FOUND,
  USER_NOT_FOUND: HttpStatus.NOT_FOUND,
  NOT_FOUND: HttpStatus.NOT_FOUND,

  UNAUTHORIZED: HttpStatus.UNAUTHORIZED,

  USER_ID_IS_NOT_UNIQUE: HttpStatus.CONFLICT,
};
