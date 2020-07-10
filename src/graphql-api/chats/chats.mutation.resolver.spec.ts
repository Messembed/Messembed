import { Test, TestingModule } from '@nestjs/testing';
import { ChatsMutationResolver } from './chats.mutation.resolver';

describe('ChatsMutationResolver', () => {
  let resolver: ChatsMutationResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatsMutationResolver],
    }).compile();

    resolver = module.get<ChatsMutationResolver>(ChatsMutationResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
