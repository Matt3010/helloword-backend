import {Injectable} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
 import {AuthService} from '../auth.service';
import { Strategy } from 'passport-google-oauth20';
import {UserWithRelations} from "../../users/users.repository";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
      private readonly authService: AuthService
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:4000/api/auth/google/callback",
      scope: ['profile', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<UserWithRelations> {
      return await this.authService.findOrCreateFromGoogle(profile);
  }
}
