import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { ConfigModule } from '@nestjs/config';
import { FriendsModule } from './friends/friends.module';
import { MessagesModule } from './messages/messages.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    AuthModule,
    ProfileModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FriendsModule,
    MessagesModule,
    GameModule,
  ],
  controllers: [],
})
export class AppModule {}
