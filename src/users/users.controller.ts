import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Put,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/User.entity';
import { CreateUserDto } from './dto/CreateUser.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserPathDto } from './dto/UserPath.dto';
import { EditUserDto } from './dto/EditUser.dto';
import { PaginatedUsersDto } from './dto/PaginatedUsers.dto';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('User')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiCreatedResponse({ type: () => User })
  async createUser(@Body() createDto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(createDto);
  }

  @Get(':userId')
  @ApiOkResponse({ type: () => User })
  async getUser(@Param() { userId }: UserPathDto): Promise<User> {
    return this.usersService.getUser(userId);
  }

  @Put(':userId')
  @ApiOkResponse({ type: () => User })
  async editUser(
    @Param() { userId }: UserPathDto,
    @Body() editDto: EditUserDto,
  ): Promise<User> {
    return this.usersService.editUser(userId, editDto);
  }

  @Get()
  @ApiOkResponse({ type: () => PaginatedUsersDto })
  async findUsers(): Promise<PaginatedUsersDto> {
    return this.usersService.findAllUsers();
  }
}
