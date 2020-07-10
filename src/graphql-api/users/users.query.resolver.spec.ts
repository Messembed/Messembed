import { Test, TestingModule } from '@nestjs/testing';
import { UsersQueryResolver } from './users.query.resolver';

describe('UsersQueryResolver', () => {
  let resolver: UsersQueryResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersQueryResolver],
    }).compile();

    resolver = module.get<UsersQueryResolver>(UsersQueryResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
