import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class MessageGqlType {
  @Field(() => ID)
  id: string | number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  deletedAt?: Date;

  @Field({ nullable: true })
  editedAt?: Date;

  @Field(() => ID)
  chatId: string | number;

  @Field(() => ID)
  userId: string | number;

  @Field()
  content: string;

  @Field()
  read: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  externalMetadata?: Record<string, any>;

  @Field(() => GraphQLJSON, { nullable: true })
  privateExternalMetadata?: Record<string, any>;
}
