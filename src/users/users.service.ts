import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private readonly usersRepository: UsersRepository) {}

    async findAuthMethod(provider: string, providerId: string) {
        return this.usersRepository.findAuthMethod(provider, providerId);
    }

    async findOrCreateFromGoogle(profile: any): Promise<User> {
        const provider = 'google';
        const providerId = profile.id;

        const existingAuth = await this.usersRepository.findAuthMethod(provider, providerId);
        if (existingAuth) {
            return existingAuth.user;
        }

        return this.usersRepository.createUserWithProfileAndAuth(profile, provider, providerId);
    }

    async upsertLogin(userId: string) {
        return this.usersRepository.updateUserProfileLogin(userId);
    }

    async adjustAttempts(userId: string, attemptsLeft: number) {
        return this.usersRepository.updateUserProfileAttempts(userId, attemptsLeft);
    }

    async addScore(userId: string, delta: number) {
        return this.usersRepository.incrementUserScore(userId, delta);
    }

    async leaderboard(limit = 50) {
        return this.usersRepository.findTopUsersByScore(limit);
    }

    async findProfileByUserId(userId: string) {
        return this.usersRepository.findProfileByUserId(userId);
    }
}
