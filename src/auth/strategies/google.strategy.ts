import {Injectable} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {Profile, Strategy} from 'passport-google-oauth20';
import {UserProfile} from "@prisma/client";
import {UsersService} from "../../users/users.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private readonly usersService: UsersService
    ) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:4000/api/auth/google/callback",
            scope: ['profile', 'email'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<UserProfile> {
        return await this.usersService.findOrCreateUser(profile);
    }
}
