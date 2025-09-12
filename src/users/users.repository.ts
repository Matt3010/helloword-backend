import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, UserProfile, AuthenticationMethod } from '@prisma/client';

type UserWithRelations = User & {
    profile: UserProfile | null;
    authMethods: AuthenticationMethod[];
};

@Injectable()
export class UsersRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findAuthMethod(provider: string, providerId: string): Promise<{ user: UserWithRelations } | null> {
        return this.prisma.authenticationMethod.findUnique({
            where: { provider_providerId: { provider, providerId } },
            include: { user: { include: { profile: true, authMethods: true } } },
        });
    }

    async createUserWithProfileAndAuth(profile: any, provider: string, providerId: string): Promise<UserWithRelations> {
        const displayName = profile.displayName || profile.emails?.[0]?.value;
        return this.prisma.user.create({
            data: {
                profile: { create: { displayName, lastLogin: new Date(), attemptsLeft: 3, lastReset: new Date() } },
                authMethods: { create: { provider, providerId } },
            },
            include: { profile: true, authMethods: true },
        });
    }

    async updateUserProfileLogin(userId: string): Promise<UserProfile> {
        return this.prisma.userProfile.update({ where: { userId }, data: { lastLogin: new Date() } });
    }

    async updateUserProfileAttempts(userId: string, attemptsLeft: number): Promise<UserProfile> {
        return this.prisma.userProfile.update({ where: { userId }, data: { attemptsLeft } });
    }

    async incrementUserScore(userId: string, delta: number): Promise<UserProfile> {
        return this.prisma.userProfile.update({ where: { userId }, data: { score: { increment: delta } } });
    }

    async findTopUsersByScore(limit: number): Promise<UserProfile[]> {
        return this.prisma.userProfile.findMany({ orderBy: { score: 'desc' }, take: limit });
    }

    async findProfileByUserId(userId: string): Promise<UserProfile | null> {
        return this.prisma.userProfile.findUnique({ where: { userId } });
    }
}
