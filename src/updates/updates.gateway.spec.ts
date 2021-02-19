import { Test, TestingModule } from '@nestjs/testing';
import { UpdatesGateway } from './updates.gateway';

describe('UpdatesGateway', () => {
  let gateway: UpdatesGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UpdatesGateway],
    }).compile();

    gateway = module.get<UpdatesGateway>(UpdatesGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
