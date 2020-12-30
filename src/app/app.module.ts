import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configModuleOptions } from '../config';
import { ChatsModule } from '../chats/chats.module';
import { UsersModule } from '../users/users.module';
import { MessagesModule } from '../messages/messages.module';
import { AuthModule } from '../auth/auth.module';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { AppResolver } from './app.resolver';
import { GraphqlApiModule } from '../graphql-api/graphql-api.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MONGODB_CONFIG_KEY,
  MongoDBConfigType,
} from '../config/mongodb.config';

@Module({
  imports: [
    AuthModule,
    ChatsModule,
    UsersModule,
    MessagesModule,
    MongooseModule.forRootAsync({
      useFactory: (mongodbConfig: MongoDBConfigType) => ({
        uri: mongodbConfig.uri,
      }),
      inject: [MONGODB_CONFIG_KEY],
    }),
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
