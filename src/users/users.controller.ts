import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserPathDto } from './dto/user-path.dto';
import { EditUserDto } from './dto/edit-user.dto';
import { ExternalServiceAuthGuard } from '../auth/guards/external-service-auth.guard';
import { AuthData } from '../auth/decorators/auth-data.decorator';
import { RequestAuthData } from '../auth/classes/request-auth-data.class';
import { UserAuthGuard } from '../auth/guards/user-auth.guard';
import { PaginatedUserInMongoDto } from './dto/paginated-user-in-mongo.dto';

@Controller()
@ApiTags('User')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * @deprecated
   */
  @Post('users')
  @UseGuards(ExternalServiceAuthGuard)
  @ApiCreatedResponse({ type: () => Object })
  async createUser(@Body() createDto: CreateUserDto): Promise<any> {
    return (await this.usersService.createUserInMongo(createDto)).toJSON();
  }

  @Get('users/:userId')
  @ApiOkResponse({ type: () => Object })
  async getUser(@Param() { userId }: UserPathDto): Promise<any> {
    return (await this.usersService.getUserFromMongo(userId)).toJSON();
  }

  /**
   * @deprecated
   */
  @Patch('users/:userId')
  @UseGuards(ExternalServiceAuthGuard)
  @ApiOkResponse({ type: () => Object })
  async editUser(
    @Param() { userId }: UserPathDto,
    @Body() editDto: EditUserDto,
  ): Promise<any> {
    return (await this.usersService.editUserInMongo(userId, editDto)).toJSON();
  }

  /**
   * @deprecated
   */
  @Get('users')
  @UseGuards(ExternalServiceAuthGuard)
  @ApiOkResponse({ type: () => PaginatedUserInMongoDto })
  async findUsers(): Promise<PaginatedUserInMongoDto> {
    return this.usersService.findAllUsersFromMongo();
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
