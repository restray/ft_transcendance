import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { ConfigModule } from '@nestjs/config';
import { FriendsModule } from './friends/friends.module';

@Module({
  imports: [
    AuthModule,
    ProfileModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FriendsModule,
  ],
  controllers: [],
})
export class AppModule {}
