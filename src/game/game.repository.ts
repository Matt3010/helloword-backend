import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Game, UserProfile } from '@prisma/client';

@Injectable()
export class GameRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Finds the most recent game.
     * @returns The most recent game object or null if none exists.
     */
    async findCurrent(): Promise<Game | null> {
        return this.prisma.game.findFirst({ orderBy: { createdAt: 'desc' } });
    }

    /**
     * Creates a new game record.
     * @param word The word for the new game.
     * @param initial The first letter of the word.
     * @returns The newly created game object.
     */
    async create(word: string, initial: string): Promise<Game> {
        return this.prisma.game.create({ data: { word, initial } });
    }

    /**
     * Resets a user's daily attempts to 3.
     * @param userId The ID of the user.
     * @param now The current date to set as the last reset time.
     * @returns The updated user profile.
     */
    async resetUserAttempts(userId: string, now: Date): Promise<UserProfile> {
        return this.prisma.userProfile.update({
            where: { userId },
            data: { attemptsLeft: 3, lastReset: now },
        });
    }

    /**
     * Decrements the number of attempts left for a user by one.
     * @param userId The ID of the user.
     * @returns The updated user profile.
     */
    async decrementUserAttempts(userId: string): Promise<UserProfile> {
        return this.prisma.userProfile.update({
            where: { userId },
            data: { attemptsLeft: { decrement: 1 } },
        });
    }

    /**
     * Retrieves all user profiles from the database.
     * @returns A promise that resolves to an array of all user profiles.
     */
    async findAllUserProfiles(): Promise<UserProfile[]> {
        return this.prisma.userProfile.findMany();
    }
}
