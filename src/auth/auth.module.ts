import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { UsersModule } from '../users/users.module';
import {JwtStrategy} from "./strategies/jwt.strategy";

@Module({
  imports: [
      PassportModule.register({ session: true }),
      UsersModule
  ],
  providers: [
      AuthService,
      GoogleStrategy,
      JwtStrategy,
  ],
  controllers: [
      AuthController
  ],
})
export class AuthModule {}
