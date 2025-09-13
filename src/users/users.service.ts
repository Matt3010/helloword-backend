import {Injectable, UnauthorizedException} from '@nestjs/common';
import {UsersRepository} from './users.repository';
import {UserProfile} from '@prisma/client';
import {Profile} from "passport-google-oauth20";

@Injectable()
export class UsersService {
    constructor(private readonly usersRepository: UsersRepository) {
    }

    async findOrCreateUser(profile: Profile): Promise<UserProfile> {
        try {
            return await this.usersRepository.upsertUserProfile(profile);
        } catch {
            throw new UnauthorizedException();
        }
    }

    async addScore(userId: string, delta: number): Promise<UserProfile> {
        return this.usersRepository.incrementUserScore(userId, delta);
    }

    async leaderboard(limit = 50): Promise<UserProfile[]> {
        return this.usersRepository.findTopUsersByScore(limit);
    }

    async findProfileByUserId(userId: string): Promise<UserProfile> { // <-- Rimosso | null
        const userProfile: UserProfile | null = await this.usersRepository.findProfileByUserId(userId);

        if (!userProfile) {
            throw new UnauthorizedException();
        }

        return userProfile;
    }
}
