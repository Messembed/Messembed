import { ObjectType, Field } from '@nestjs/graphql';
import { ChatGqlType } from './chat.gql-type';

@ObjectType()
export class PaginatedChatsGqlType {
  @Field(() => [ChatGqlType])
  chats: ChatGqlType[];
}
