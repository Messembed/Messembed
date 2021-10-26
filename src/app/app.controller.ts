import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  @Get('ping')
  @ApiOkResponse({ type: String })
  ping(): string {
    return 'pong';
  }
}
