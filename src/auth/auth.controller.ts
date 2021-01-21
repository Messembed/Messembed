import {
  Controller,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { CookiesAuthGuard } from './guards/cookies-auth.guard';
import { AuthData } from './decorators/auth-data.decorator';
import { RequestAuthData } from './classes/request-auth-data.class';

@Controller()
@ApiTags('Auth')
@UseInterceptors(ClassSerializerInterceptor)
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
  }),
)
export class AuthController {
  @Get('cookies-test')
  @UseGuards(CookiesAuthGuard)
  @ApiCookieAuth()
  async testCookies(@AuthData() authData: RequestAuthData): Promise<any> {
    return authData;
  }
}
