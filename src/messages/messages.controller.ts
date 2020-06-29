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
import { AuthData } from '../auth/decorators/AuthData.decorator';
import { RequestAuthData } from '../auth/classes/RequestAuthData.class';
import { ExternalServiceAuthGuard } from '../auth/guards/ExternalServiceAuthGuard.guard';
import { JwtAuthGuard } from '../auth/guards/JwtAuthGuard.guard';
import { CreateMessageAsExternalServiceDto } from './dto/CreateMessageAsExternalService.dto';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('chats/:chatId/messages/actions/createMessageAsExternalService')
  @UseGuards(ExternalServiceAuthGuard)
  @ApiCreatedResponse({ type: () => Message })
  async createMessageAsExternalService(
    @Param() { chatId }: ChatPathDto,
    @Body() dto: CreateMessageAsExternalServiceDto,
  ): Promise<Message> {
    return this.messagesService.createMessage({
      ...dto,
      chatId,
    });
  }

  @Post('chats/:chatId/messages')
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse({ type: () => Message })
  async createMessage(
    @Param() { chatId }: ChatPathDto,
    @Body() createDto: CreateMessageDto,
    @AuthData() authData: RequestAuthData,
  ): Promise<Message> {
    return this.messagesService.createMessage({
      ...createDto,
      chatId,
      userId: authData.user.id,
    });
  }

  @Get('chats/:chatId/messages')
  @UseGuards(JwtOrExternalServiceAuthGuard)
  @ApiOkResponse({ type: () => PaginatedMessagesDto, isArray: true })
  async getMessages(
    @Param() { chatId }: ChatPathDto,
    @Query() filters: GetMessagesFiltersDto,
    @AuthData() authData: RequestAuthData,
  ): Promise<PaginatedMessagesDto> {
    return this.messagesService.getPaginatedMessagesConsideringAccessRights(
      authData,
      chatId,
      filters,
    );
  }
}
