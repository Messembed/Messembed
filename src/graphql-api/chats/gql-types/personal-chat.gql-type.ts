import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class PersonalChatGqlType {
  @Field(() => ID)
  id: string | number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  deletedAt?: Date;

  @Field()
  title: string;

  @Field()
  active: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  externalMetadata?: Record<string, unknown> | null;

  @Field(() => ID, { nullable: true })
  lastMessageId: number;

  // lastMessage: Message;

  // companion: User;

  @Field(() => Int)
  unreadMessagesCount: number;
}
