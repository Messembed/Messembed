import {
  Controller,
  UseInterceptors,
  ClassSerializerInterceptor,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiCreatedResponse, ApiBasicAuth } from '@nestjs/swagger';
import { AccessTokenDto } from './dto/AccessToken.dto';
import { AuthService } from './auth.service';
import { ExternalServiceAuthGuard } from './guards/ExternalServiceAuthGuard.guard';
import { UserPathDto } from '../users/dto/UserPath.dto';

@Controller()
@ApiTags('Auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('users/:userId/access-tokens')
  @UseGuards(ExternalServiceAuthGuard)
  @ApiBasicAuth()
  @ApiCreatedResponse({ type: () => AccessTokenDto })
  async getAccessTokenForUser(
    @Param() { userId }: UserPathDto,
  ): Promise<AccessTokenDto> {
    return this.authService.createAccessTokenByUserId(userId);
  }
}
