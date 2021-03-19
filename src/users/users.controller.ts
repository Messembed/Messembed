import { Controller, Param, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserPathDto } from './dto/user-path.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserMongoDocument } from './schemas/user.schema';

@Controller()
@ApiTags('User')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('users/:userId')
  @ApiOkResponse({ type: () => Object })
  async getUser(@Param() { userId }: UserPathDto): Promise<any> {
    return (await this.usersService.getUser(userId)).toJSON();
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: () => Object })
  async getMe(@CurrentUser() currentUser: UserMongoDocument): Promise<any> {
    return (await this.usersService.getUser(currentUser._id)).toJSON();
  }
}
