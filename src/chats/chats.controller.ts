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
import { PersonalChatDto } from './dto/PersonalChat.dto';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Chat')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post('chats')
  @ApiCreatedResponse({ type: () => Chat })
  async createChat(@Body() createDto: CreateChatDto): Promise<Chat> {
    return this.chatsService.createChat(createDto);
  }

  @Put('chats/:chatId')
  @ApiOkResponse({ type: () => Chat })
  async editChat(
    @Param() { chatId }: ChatPathDto,
    @Body() editDto: EditChatDto,
  ): Promise<Chat> {
    return this.chatsService.editChat(chatId, editDto);
  }

  @Get('chats/:chatId')
  @ApiOkResponse({ type: () => Chat })
  async getChat(@Param() { chatId }: ChatPathDto): Promise<Chat> {
    return this.chatsService.getChat(chatId);
  }

  @Get('chats')
  @ApiOkResponse({ type: () => PaginatedChatsDto })
  async getAllChats(): Promise<PaginatedChatsDto> {
    return this.chatsService.getAllChats();
  }

  @Get('users/:externalUserId/personalChats')
  @ApiOkResponse({ type: () => PersonalChatDto, isArray: true })
  async getMyChats(
    @Param('externalUserId') externalUserId: string,
  ): Promise<PersonalChatDto[]> {
    return this.chatsService.getPersonalChats(externalUserId);
  }
}
