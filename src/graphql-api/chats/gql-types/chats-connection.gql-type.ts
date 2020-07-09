import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ChatGqlType } from './chat.gql-type';

@ObjectType()
export class ChatsConnectionGqlType {
  @Field(() => Int)
  totalCount: number;

  @Field(() => [ChatGqlType])
  nodes: ChatGqlType[];
}
