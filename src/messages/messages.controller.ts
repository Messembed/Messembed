import {
  Controller,
  Body,
  Post,
  Param,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateMessageDto } from './dto/CreateMessage.dto';
import { Message } from './entities/Message.entity';
import { MessagesService } from './messages.service';
import { ChatPathDto } from '../chats/dto/ChatPath.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetMessagesFiltersDto } from './dto/GetMessagesFilters.dto';
import { PaginatedMessagesDto } from './dto/PaginatedMessages.dto';
import { JwtOrExternalServiceAuthGuard } from '../auth/guards/JwtOrExternalServiceAuthGuard.guard';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('chats/:chatId/messages')
  @UseGuards(JwtOrExternalServiceAuthGuard)
  @ApiCreatedResponse({ type: () => Message })
  async createMessage(
    @Param() { chatId }: ChatPathDto,
    @Body() createDto: CreateMessageDto,
  ): Promise<Message> {
    return this.messagesService.createMessage({
      ...createDto,
      chatId,
      userId: '1',
    });
  }

  @Get('chats/:chatId/messages')
  @UseGuards(JwtOrExternalServiceAuthGuard)
  @ApiOkResponse({ type: () => PaginatedMessagesDto, isArray: true })
  async getMessages(
    @Param() { chatId }: ChatPathDto,
    @Query() filters: GetMessagesFiltersDto,
  ): Promise<PaginatedMessagesDto> {
    return this.messagesService.getPaginatedMessages(chatId, filters);
  }
}
