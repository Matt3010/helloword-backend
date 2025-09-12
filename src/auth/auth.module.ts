import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
      PassportModule.register({ session: false }),
      UsersModule
  ],
  providers: [
      AuthService,
      GoogleStrategy
  ],
  controllers: [
      AuthController
  ],
})
export class AuthModule {}
