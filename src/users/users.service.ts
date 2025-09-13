import { Injectable } from '@nestjs/common';
import { UsersRepository, UserWithRelations } from './users.repository';
import { UserProfile } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private readonly usersRepository: UsersRepository) {}

    /**
     * Finds an existing user via their Google profile ID or creates a new one.
     * @param profile - The user profile object from Google OAuth.
     * @returns The found or created user, complete with their profile and auth methods.
     */
    async findOrCreateFromGoogle(profile: any): Promise<UserWithRelations> {
        const provider = 'google';
        const providerId = profile.id;

        const existingAuth: { user: UserWithRelations } | null = await this.usersRepository.findAuthMethod(provider, providerId);
        if (existingAuth) {
            await this.usersRepository.updateUserProfileLogin(existingAuth.user.id);
            return existingAuth.user;
        }

        return this.usersRepository.createUserWithProfileAndAuth(profile, provider, providerId);
    }

    /**
     * Adds a certain amount to a user's score.
     * @param userId - The ID of the user.
     * @param delta - The amount to add to the score (can be negative).
     * @returns The updated user profile.
     */
    async addScore(userId: string, delta: number): Promise<UserProfile> {
        return this.usersRepository.incrementUserScore(userId, delta);
    }

    /**
     * Retrieves the leaderboard of top users by score.
     * @param limit - The number of users to retrieve.
     * @returns An array of user profiles sorted by score.
     */
    async leaderboard(limit = 50): Promise<UserProfile[]> {
        return this.usersRepository.findTopUsersByScore(limit);
    }

    /**
     * Finds a user's profile by their user ID.
     * @param userId - The ID of the user.
     * @returns The user profile or null if not found.
     */
    async findProfileByUserId(userId: string): Promise<UserProfile | null> {
        return this.usersRepository.findProfileByUserId(userId);
    }
}
