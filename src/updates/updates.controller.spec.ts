import { Test, TestingModule } from '@nestjs/testing';
import { UpdatesController } from './updates.controller';

describe('Updates Controller', () => {
  let controller: UpdatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpdatesController],
    }).compile();

    controller = module.get<UpdatesController>(UpdatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
