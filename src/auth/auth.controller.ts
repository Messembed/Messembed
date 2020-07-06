import {
  Controller,
  UseInterceptors,
  ClassSerializerInterceptor,
  Post,
  Param,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiCreatedResponse, ApiBasicAuth } from '@nestjs/swagger';
import { AccessTokenDto } from './dto/access-token.dto';
import { AuthService } from './auth.service';
import { ExternalServiceAuthGuard } from './guards/external-service-auth.guard';
import { UserPathDto } from '../users/dto/user-path.dto';

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
