import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Put,
  ClassSerializerInterceptor,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserPathDto } from './dto/user-path.dto';
import { EditUserDto } from './dto/edit-user.dto';
import { PaginatedUsersDto } from './dto/paginated-users.dto';
import { ExternalServiceAuthGuard } from '../auth/guards/external-service-auth.guard';
import { AuthData } from '../auth/decorators/auth-data.decorator';
import { RequestAuthData } from '../auth/classes/request-auth-data.class';
import { UserAuthGuard } from '../auth/guards/user-auth.guard';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('User')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('users')
  @UseGuards(ExternalServiceAuthGuard)
  @ApiCreatedResponse({ type: () => User })
  async createUser(@Body() createDto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(createDto);
  }

  @Get('users/:userId')
  @ApiOkResponse({ type: () => User })
  async getUser(@Param() { userId }: UserPathDto): Promise<User> {
    return this.usersService.getUser(userId);
  }

  @Put('users/:userId')
  @UseGuards(ExternalServiceAuthGuard)
  @ApiOkResponse({ type: () => User })
  async editUser(
    @Param() { userId }: UserPathDto,
    @Body() editDto: EditUserDto,
  ): Promise<User> {
    return this.usersService.editUser(userId, editDto);
  }

  @Get('users')
  @UseGuards(ExternalServiceAuthGuard)
  @ApiOkResponse({ type: () => PaginatedUsersDto })
  async findUsers(): Promise<PaginatedUsersDto> {
    return this.usersService.findAllUsers();
  }

  @Get('user')
  @UseGuards(UserAuthGuard)
  @ApiOkResponse({ type: () => User })
  async getMe(@AuthData() authData: RequestAuthData): Promise<User> {
    return this.usersService.getUser(authData.user.id);
  }
}
