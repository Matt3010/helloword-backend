import {Injectable} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {UserProfile} from '@prisma/client';
import {Profile} from "passport-google-oauth20";


@Injectable()
export class UsersRepository {
    constructor(private readonly prisma: PrismaService) {
    }

    async upsertUserProfile(profile: Profile): Promise<UserProfile> {
        const picture: string | null = profile._json.picture || null;

        return this.prisma.userProfile.upsert({
            where: {id: profile.id},
            update: {
                lastLogin: new Date(),
            },
            create: {
                id: profile.id,
                picture,
                score: 0,
                attemptsLeft: 3,
                lastLogin: new Date(),
                lastReset: new Date(),
                email: profile.emails?.[0]?.value ?? "",
            },
        });
    }


    async updateUserProfileLogin(id: string): Promise<UserProfile> {
        return this.prisma.userProfile.update({where: {id}, data: {lastLogin: new Date()}});
    }

    async incrementUserScore(id: string, delta: number): Promise<UserProfile> {
        return this.prisma.userProfile.update({where: {id}, data: {score: {increment: delta}}});
    }

    async findTopUsersByScore(limit: number): Promise<UserProfile[]> {
        return this.prisma.userProfile.findMany({orderBy: {score: 'desc'}, take: limit});
    }

    async findProfileByUserId(id: string): Promise<UserProfile | null> {
        return this.prisma.userProfile.findUnique({where: {id}});
    }
}
