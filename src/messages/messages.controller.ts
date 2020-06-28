import {
  Controller,
  Body,
  Post,
  Param,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
} from '@nestjs/common';
import { CreateMessageDto } from './dtos/CreateMessage.dto';
import { Message } from './entities/Message.entity';
import { MessagesService } from './messages.service';
import { ChatPathDto } from '../chats/dto/ChatPath.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetMessagesFiltersDto } from './dtos/GetMessagesFilters.dto';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('chats/:chatId/messages')
  @ApiCreatedResponse({ type: () => Message })
  async createMessage(
    @Param() { chatId }: ChatPathDto,
    @Body() createDto: CreateMessageDto,
  ): Promise<Message> {
    return this.messagesService.createMessage({
      ...createDto,
      chatId,
      userId: 1,
    });
  }

  @Get('chats/:chatId/messages')
  @ApiOkResponse({ type: () => Message, isArray: true })
  async getMessages(
    @Param() { chatId }: ChatPathDto,
    @Query() filters: GetMessagesFiltersDto,
  ): Promise<Message[]> {
    return this.messagesService.getMessages(chatId, filters);
  }
}
