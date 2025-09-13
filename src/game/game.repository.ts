import {Injectable} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {Game, UserProfile} from '@prisma/client';

@Injectable()
export class GameRepository {
    constructor(private readonly prisma: PrismaService) {
    }

    async findCurrent(): Promise<Game | null> {
        return this.prisma.game.findFirst({orderBy: {createdAt: 'desc'}});
    }

    async create(word: string, initial: string): Promise<Game> {
        return this.prisma.game.create({data: {word, initial}});
    }

    async resetUserAttempts(id: string, now: Date): Promise<UserProfile> {
        return this.prisma.userProfile.update({
            where: {id},
            data: {attemptsLeft: 3, lastReset: now},
        });
    }

    async decrementUserAttempts(id: string): Promise<UserProfile> {
        return this.prisma.userProfile.update({
            where: {id},
            data: {attemptsLeft: {decrement: 1}},
        });
    }

    async findAllUserProfiles(): Promise<UserProfile[]> {
        return this.prisma.userProfile.findMany();
    }
}
