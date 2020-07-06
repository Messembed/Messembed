import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configModuleOptions } from '../config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatsModule } from '../chats/chats.module';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from '../messages/messages.module';
import { AuthModule } from '../auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { AppResolver } from './app.resolver';
import { GraphqlApiModule } from '../graphql-api/graphql-api.module';

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
    }),
    GraphqlApiModule,
  ],
  controllers: [AppController],
  providers: [AppResolver],
})
export class AppModule {}
