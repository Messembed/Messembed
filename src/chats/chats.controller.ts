import {
  Controller,
  Body,
  Post,
  Put,
  Param,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { Chat } from './entities/Chat.entity';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/CreateChat.dto';
import { ApiOkResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { ChatPathDto } from './dto/ChatPath.dto';
import { EditChatDto } from './dto/EditChat.dto';
import { PaginatedChatsDto } from './dto/PaginatedChats.dto';

@Controller('chats')
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Chat')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  @ApiCreatedResponse({ type: () => Chat })
  async createChat(@Body() createDto: CreateChatDto): Promise<Chat> {
    return this.chatsService.createChat(createDto);
  }

  @Put(':chatId')
  @ApiOkResponse({ type: () => Chat })
  async editChat(
    @Param() { chatId }: ChatPathDto,
    @Body() editDto: EditChatDto,
  ): Promise<Chat> {
    return this.chatsService.editChat(chatId, editDto);
  }

  @Get(':chatId')
  @ApiOkResponse({ type: () => Chat })
  async getChat(@Param() { chatId }: ChatPathDto): Promise<Chat> {
    return this.chatsService.getChat(chatId);
  }

  @Get()
  @ApiOkResponse({ type: () => PaginatedChatsDto })
  async getAllChats(): Promise<PaginatedChatsDto> {
    return this.chatsService.getAllChats();
  }
}
