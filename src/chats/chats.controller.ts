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
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthData } from '../auth/decorators/auth-data.decorator';
import { RequestAuthData } from '../auth/classes/request-auth-data.class';
import { ChatsQueryDto } from './dto/chats-query.dto';
import { UserAuthGuard } from '../auth/guards/user-auth.guard';
import { ChatPathForMongoDto } from './dto/chat-path-for-mongo.dto';
import { Types } from 'mongoose';
import { PersonalChatFromMongoDto } from './dto/personal-chat-from-mongo.dto';
import { UserMongoDocument } from '../users/schemas/user.schema';
import { CreatePersonalChatDto } from './dto/create-personal-chat.dto';

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

  @Post('user/personal-chats')
  @UseGuards(UserAuthGuard)
  @ApiOkResponse({ type: () => PersonalChatFromMongoDto })
  async createPersonalChat(
    @Body() createData: CreatePersonalChatDto,
    @AuthData() authData: RequestAuthData,
  ): Promise<PersonalChatFromMongoDto> {
    return this.chatsService.createPersonalChat(
      authData.user.externalId,
      createData,
    );
  }

  @Get('user/personal-chats')
  @UseGuards(UserAuthGuard)
  @ApiOkResponse({ type: () => Object, isArray: true })
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
  @ApiOkResponse({ type: () => Object })
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
  @ApiOkResponse({ type: () => Object })
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
