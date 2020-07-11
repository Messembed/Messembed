import { ObjectType, Field, Int } from '@nestjs/graphql';
import { MessageGqlType } from './message.gql-type';

@ObjectType()
export class MessagesConnectionGqlType {
  @Field(() => Int, { nullable: true })
  afterId?: number;

  @Field(() => Int, { nullable: true })
  beforeId?: number;

  @Field(() => Int, { nullable: true })
  offset?: number;

  @Field(() => Int, { nullable: true })
  limit?: number;

  @Field(() => [MessageGqlType])
  messages: MessageGqlType[];
}
