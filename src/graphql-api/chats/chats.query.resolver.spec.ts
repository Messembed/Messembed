import { Test, TestingModule } from '@nestjs/testing';
import { ChatsQueryResolver } from './chats.query.resolver';

describe('ChatsQueryResolver', () => {
  let resolver: ChatsQueryResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatsQueryResolver],
    }).compile();

    resolver = module.get<ChatsQueryResolver>(ChatsQueryResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
