import { Injectable } from '@nestjs/common';
import { UsersRepository, UserWithRelations } from './users.repository';
import { UserProfile } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private readonly usersRepository: UsersRepository) {}

    /**
     * Finds an authentication method by provider and providerId.
     * @returns The user associated with the auth method, including profile and other auth methods, or null if not found.
     */
    async findAuthMethod(provider: string, providerId: string): Promise<{ user: UserWithRelations } | null> {
        return this.usersRepository.findAuthMethod(provider, providerId);
    }

    /**
     * Finds an existing user via their Google profile ID or creates a new one.
     * @param profile - The user profile object from Google OAuth.
     * @returns The found or created user, complete with their profile and auth methods.
     */
    async findOrCreateFromGoogle(profile: any): Promise<UserWithRelations> {
        const provider = 'google';
        const providerId = profile.id;

        const existingAuth = await this.usersRepository.findAuthMethod(provider, providerId);
        if (existingAuth) {
            // Se l'utente esiste, aggiorniamo la sua data di ultimo login
            await this.usersRepository.updateUserProfileLogin(existingAuth.user.id);
            return existingAuth.user;
        }

        return this.usersRepository.createUserWithProfileAndAuth(profile, provider, providerId);
    }

    /**
     * Updates the last login timestamp for a user.
     * @param userId - The ID of the user.
     * @returns The updated user profile.
     */
    async upsertLogin(userId: string): Promise<UserProfile> {
        return this.usersRepository.updateUserProfileLogin(userId);
    }

    /**
     * Adjusts the number of attempts left for a user.
     * @param userId - The ID of the user.
     * @param attemptsLeft - The new number of attempts.
     * @returns The updated user profile.
     */
    async adjustAttempts(userId: string, attemptsLeft: number): Promise<UserProfile> {
        return this.usersRepository.updateUserProfileAttempts(userId, attemptsLeft);
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
