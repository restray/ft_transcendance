import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/prisma/user/user.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [
    PrismaService,
    GameGateway,
    GameService,
    JwtService,
    UserService,
    ConfigService,
  ],
  controllers: [GameController],
})
export class GameModule {}
