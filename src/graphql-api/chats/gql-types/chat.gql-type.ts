import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class ChatGqlType {
  @Field(() => ID)
  id: string | number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  deletedAt?: Date | null;

  @Field()
  title: string;

  @Field()
  active: boolean;

  @Field()
  firstCompanionId: string;

  @Field()
  secondCompanionId: string;

  @Field(() => GraphQLJSON, { nullable: true })
  externalMetadata?: Record<string, unknown> | null;

  @Field(() => GraphQLJSON, { nullable: true })
  privateExternalMetadata?: Record<string, unknown> | null;

  @Field({ nullable: true })
  lastMessageId?: number;
}
