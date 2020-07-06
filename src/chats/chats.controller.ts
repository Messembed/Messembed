import {
  Controller,
  Body,
  Post,
  Put,
  Param,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { Chat } from './entities/chat.entity';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { ApiOkResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { ChatPathDto } from './dto/chat-path.dto';
import { EditChatDto } from './dto/edit-chat.dto';
import { PaginatedChatsDto } from './dto/paginated-chats.dto';
import { PersonalChatDto } from './dto/personal-chat.dto';
import { ExternalServiceAuthGuard } from '../auth/guards/external-service-auth.guard';
import { AuthData } from '../auth/decorators/auth-data.decorator';
import { RequestAuthData } from '../auth/classes/request-auth-data.class';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatsQueryDto } from './dto/chats-query.dto';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Chat')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
  }),
)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post('chats')
  @ApiCreatedResponse({ type: () => Chat })
  @UseGuards(ExternalServiceAuthGuard)
  async createChat(@Body() createDto: CreateChatDto): Promise<Chat> {
    return this.chatsService.createChat(createDto);
  }

  @Put('chats/:chatId')
  @UseGuards(ExternalServiceAuthGuard)
  @ApiOkResponse({ type: () => Chat })
  async editChat(
    @Param() { chatId }: ChatPathDto,
    @Body() editDto: EditChatDto,
  ): Promise<Chat> {
    return this.chatsService.editChat(chatId, editDto);
  }

  @Get('chats/:chatId')
  @UseGuards(ExternalServiceAuthGuard)
  @ApiOkResponse({ type: () => Chat })
  async getChat(@Param() { chatId }: ChatPathDto): Promise<Chat> {
    return this.chatsService.getChat(chatId);
  }

  @Get('chats')
  @UseGuards(ExternalServiceAuthGuard)
  @ApiOkResponse({ type: () => PaginatedChatsDto })
  async getAllChats(): Promise<PaginatedChatsDto> {
    return this.chatsService.getAllChats();
  }

  @Get('user/personal-chats')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: () => PersonalChatDto, isArray: true })
  async getPersonalChats(
    @Query() query: ChatsQueryDto,
    @AuthData() authData: RequestAuthData,
  ): Promise<PersonalChatDto[]> {
    return this.chatsService.getPersonalChatsOfUser(authData.user.id, query);
  }

  @Get('user/personal-chats/:chatId')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: () => PersonalChatDto })
  async getPersonalChat(
    @Param() { chatId }: ChatPathDto,
    @AuthData() authData: RequestAuthData,
  ): Promise<PersonalChatDto> {
    return this.chatsService.getPersonalChatOfUserOrFailHttp(
      authData.user.id,
      chatId,
    );
  }

  @Post('user/personal-chats/:chatId/read-status')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: () => PersonalChatDto })
  async setRead(
    @Param() { chatId }: ChatPathDto,
    @AuthData() authData: RequestAuthData,
  ): Promise<PersonalChatDto> {
    return this.chatsService.readPersonalChatAsUser(chatId, authData.user.id);
  }
}
