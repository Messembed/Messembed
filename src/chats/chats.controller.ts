import {
  Controller,
  Body,
  Post,
  Param,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Query,
  Patch,
} from '@nestjs/common';
import { Chat } from './entities/chat.entity';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { ApiOkResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { EditChatDto } from './dto/edit-chat.dto';
import { PaginatedChatsDto } from './dto/paginated-chats.dto';
import { PersonalChatDto } from './dto/personal-chat.dto';
import { ExternalServiceAuthGuard } from '../auth/guards/external-service-auth.guard';
import { AuthData } from '../auth/decorators/auth-data.decorator';
import { RequestAuthData } from '../auth/classes/request-auth-data.class';
import { ChatsQueryDto } from './dto/chats-query.dto';
import { UserAuthGuard } from '../auth/guards/user-auth.guard';
import { ChatPathForMongoDto } from './dto/chat-path-for-mongo.dto';
import { PaginatedChatsInMongoDto } from './dto/paginated-chats-from-mongo.dto';
import { Types } from 'mongoose';
import { PersonalChatFromMongoDto } from './dto/personal-chat-from-mongo.dto';
import { UserMongoDocument } from '../users/schemas/user.schema';

@Controller()
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
  async createChat(@Body() createDto: CreateChatDto): Promise<any> {
    return (await this.chatsService.createChatInMongo(createDto)).toJSON();
  }

  @Patch('chats/:chatId')
  @UseGuards(ExternalServiceAuthGuard)
  @ApiOkResponse({ type: () => Chat })
  async editChat(
    @Param() { chatId }: ChatPathForMongoDto,
    @Body() editDto: EditChatDto,
  ): Promise<any> {
    return (
      await this.chatsService.editChatInMongo(
        new Types.ObjectId(chatId),
        editDto,
      )
    ).toJSON();
  }

  @Get('chats/:chatId')
  @UseGuards(ExternalServiceAuthGuard)
  @ApiOkResponse({ type: () => Chat })
  async getChat(@Param() { chatId }: ChatPathForMongoDto): Promise<any> {
    return (
      await this.chatsService.getChatFromMongoOrFailHttp(
        new Types.ObjectId(chatId),
      )
    ).toJSON();
  }

  @Get('chats')
  @UseGuards(ExternalServiceAuthGuard)
  @ApiOkResponse({ type: () => PaginatedChatsDto })
  async getAllChats(): Promise<PaginatedChatsInMongoDto> {
    return this.chatsService.getAllChatsFromMongo();
  }

  @Get('user/personal-chats')
  @UseGuards(UserAuthGuard)
  @ApiOkResponse({ type: () => PersonalChatDto, isArray: true })
  async getPersonalChats(
    @Query() query: ChatsQueryDto,
    @AuthData() authData: RequestAuthData,
  ): Promise<PersonalChatFromMongoDto[]> {
    return this.chatsService.getPersonalChatsFromMongoOfUser(
      (authData.user as UserMongoDocument)._id,
      query,
    );
  }

  @Get('user/personal-chats/:chatId')
  @UseGuards(UserAuthGuard)
  @ApiOkResponse({ type: () => PersonalChatDto })
  async getPersonalChat(
    @Param() { chatId }: ChatPathForMongoDto,
    @AuthData() authData: RequestAuthData,
  ): Promise<PersonalChatFromMongoDto> {
    return this.chatsService.getPersonalChatOfUserFromMongoOrFailHttp(
      (authData.user as UserMongoDocument)._id,
      new Types.ObjectId(chatId),
    );
  }

  @Post('user/personal-chats/:chatId/read-status')
  @UseGuards(UserAuthGuard)
  @ApiOkResponse({ type: () => PersonalChatDto })
  @UseInterceptors(ClassSerializerInterceptor)
  async setRead(
    @Param() { chatId }: ChatPathForMongoDto,
    @AuthData() authData: RequestAuthData,
  ): Promise<PersonalChatFromMongoDto> {
    return this.chatsService.readPersonalChatInMongoAsUser(
      new Types.ObjectId(chatId),
      (authData.user as UserMongoDocument)._id,
    );
  }
}
