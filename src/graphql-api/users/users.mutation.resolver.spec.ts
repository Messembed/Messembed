import { Test, TestingModule } from '@nestjs/testing';
import { UsersMutationResolver } from './users.mutation.resolver';

describe('UsersMutationResolver', () => {
  let resolver: UsersMutationResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersMutationResolver],
    }).compile();

    resolver = module.get<UsersMutationResolver>(UsersMutationResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
