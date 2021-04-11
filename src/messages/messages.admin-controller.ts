import {
  Controller,
  Body,
  Post,
  Param,
  Get,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ChatPathDto } from '../chats/dto/chat-path.dto';
import { Types } from 'mongoose';
import { GetMessagesFiltersDto } from './dto/get-messages-filters.dto';
import { PaginatedMessagesDto } from './dto/paginated-messages.dto';
import { ExternalServiceAuthGuard } from '../auth/guards/external-service-auth.guard';
import { CreateMessageAsAdminDto } from './dto/create-message-as-admin.dto';
import { PaginatedMessagesForAdminDto } from './dto/paginated-messages-for-admin.dto';

@Controller()
@ApiTags('Messages')
export class MessagesAdminController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('admin-api/chats/:chatId/messages')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  @UseGuards(ExternalServiceAuthGuard)
  @ApiCreatedResponse({ type: () => Object })
  async createMessage(
    @Param() { chatId }: ChatPathDto,
    @Body() createDto: CreateMessageAsAdminDto,
  ): Promise<any> {
    return (
      await this.messagesService.sendMessage({
        ...createDto,
        chatId: new Types.ObjectId(chatId),
        userId: createDto.userId,
      })
    ).toJSON();
  }

  @Get('admin-api/chats/:chatId/messages')
  @UseGuards(ExternalServiceAuthGuard)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  @ApiOkResponse({ type: () => Object, isArray: true })
  async getMessages(
    @Param() { chatId }: ChatPathDto,
    @Query() filters: GetMessagesFiltersDto,
  ): Promise<PaginatedMessagesForAdminDto> {
    return this.messagesService.getPaginatedMessagesForAdmin(
      Types.ObjectId(chatId),
      filters,
    );
  }

  @Get('admin-api/messages')
  @UseGuards(ExternalServiceAuthGuard)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  @ApiOkResponse({ type: () => PaginatedMessagesDto, isArray: true })
  async findMessages(
    @Query() filters: GetMessagesFiltersDto,
  ): Promise<PaginatedMessagesDto> {
    return this.messagesService.getAllMessagesForAdminWrapped(filters);
  }
}
