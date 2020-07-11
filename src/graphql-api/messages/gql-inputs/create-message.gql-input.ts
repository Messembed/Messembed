import { Field, Int, InputType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@InputType()
export class CreateMessageGqlInput {
  @Field(() => Int)
  chatId: number;

  @Field({ nullable: true })
  userId: string;

  @Field()
  content: string;

  @Field(() => GraphQLJSON, { nullable: true })
  externalMetadata?: Record<string, any>;

  @Field(() => GraphQLJSON, { nullable: true })
  privateExternalMetadata?: Record<string, any>;
}
