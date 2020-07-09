import { InputType, Field } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@InputType()
export class CreateChatGqlInput {
  @Field()
  title: string;

  @Field(() => GraphQLJSON, { nullable: true })
  externalMetadata?: Record<string, any> | null;

  @Field(() => GraphQLJSON, { nullable: true })
  privateExternalMetadata?: Record<string, unknown>;

  @Field()
  firstCompanionId: string;

  @Field()
  secondCompanionId: string;
}
