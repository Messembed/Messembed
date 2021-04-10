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
import { PaginatedUsersDto } from './dto/paginated-users.dto';

@Controller()
@ApiTags('User')
export class UsersAdminController {
  constructor(private readonly usersService: UsersService) {}

  @Post('admin-api/users')
  @UseGuards(ExternalServiceAuthGuard)
  @ApiCreatedResponse({ type: () => Object })
  async createUser(@Body() createDto: CreateUserDto): Promise<any> {
    return (await this.usersService.createUser(createDto)).toJSON();
  }

  @Patch('admin-api/users/:userId')
  @UseGuards(ExternalServiceAuthGuard)
  @ApiOkResponse({ type: () => Object })
  async editUser(
    @Param() { userId }: UserPathDto,
    @Body() editDto: EditUserDto,
  ): Promise<any> {
    return (await this.usersService.editUser(userId, editDto)).toJSON();
  }

  @Get('admin-api/users')
  @UseGuards(ExternalServiceAuthGuard)
  @ApiOkResponse({ type: () => PaginatedUsersDto })
  async findUsers(): Promise<PaginatedUsersDto> {
    return this.usersService.getAllUsers();
  }
}
