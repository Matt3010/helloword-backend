import {Injectable} from '@nestjs/common';
import {UsersService} from '../users/users.service';
import * as jwt from 'jsonwebtoken';
import {JsonWebTokenError} from 'jsonwebtoken';
import {UserProfile} from "@prisma/client";

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UsersService) {
    }

    async issueToken(user: any): Promise<string> {
        if (!process.env.JWT_SECRET) {
            throw new JsonWebTokenError('JWT secret not provided');
        }

        const payload = {sub: user.id};
        return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '7d'});
    }

    async me(userId: string): Promise<UserProfile> {
        return this.usersService.findProfileByUserId(userId);
    }
}
