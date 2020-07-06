import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configModuleOptions } from '../config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsModule } from '../chats/chats.module';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from '../messages/messages.module';
import { AuthModule } from '../auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';

@Module({
  imports: [
    AuthModule,
    ChatsModule,
    UsersModule,
    MessagesModule,
    TypeOrmModule.forRoot(),
    ConfigModule.forRoot(configModuleOptions),
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
      // context: ctx => {
      //   return {
      //     req: ctx.req,
      //     res: ctx.res,
      //   };
      // },
    }),
  ],
})
export class AppModule {}
