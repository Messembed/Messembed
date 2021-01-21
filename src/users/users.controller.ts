import { Controller, Param, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserPathDto } from './dto/user-path.dto';
import { AuthData } from '../auth/decorators/auth-data.decorator';
import { RequestAuthData } from '../auth/classes/request-auth-data.class';
import { UserAuthGuard } from '../auth/guards/user-auth.guard';

@Controller()
@ApiTags('User')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('users/:userId')
  @ApiOkResponse({ type: () => Object })
  async getUser(@Param() { userId }: UserPathDto): Promise<any> {
    return (await this.usersService.getUserFromMongo(userId)).toJSON();
  }

  @Get('user')
  @UseGuards(UserAuthGuard)
  @ApiOkResponse({ type: () => Object })
  async getMe(@AuthData() authData: RequestAuthData): Promise<any> {
    return (
      await this.usersService.getUserFromMongo(authData.user.externalId)
    ).toJSON();
  }
}
