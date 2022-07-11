import { Test, TestingModule } from '@nestjs/testing';
import { ChannelPrivateController } from './channel.private.controller';

describe('ChannelPrivateController', () => {
  let controller: ChannelPrivateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChannelPrivateController],
    }).compile();

    controller = module.get<ChannelPrivateController>(ChannelPrivateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
