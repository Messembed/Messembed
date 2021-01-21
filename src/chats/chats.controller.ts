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
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { ApiOkResponse, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { EditChatDto } from './dto/edit-chat.dto';
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

  @Post('chats')
  @ApiCreatedResponse({ type: () => Object })
  @UseGuards(ExternalServiceAuthGuard)
  async createChat(@Body() createDto: CreateChatDto): Promise<any> {
    return (await this.chatsService.createChatInMongo(createDto)).toJSON();
  }

  @Patch('chats/:chatId')
  @UseGuards(ExternalServiceAuthGuard)
  @ApiOkResponse({ type: () => Object })
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
  @ApiOkResponse({ type: () => Object })
  async getChat(@Param() { chatId }: ChatPathForMongoDto): Promise<any> {
    return (
      await this.chatsService.getChatFromMongoOrFailHttp(
        new Types.ObjectId(chatId),
      )
    ).toJSON();
  }

  @Get('chats')
  @UseGuards(ExternalServiceAuthGuard)
  @ApiOkResponse({ type: () => Object })
  async getAllChats(): Promise<PaginatedChatsInMongoDto> {
    return this.chatsService.getAllChatsFromMongo();
  }

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
