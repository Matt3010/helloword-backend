import {Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {ExtractJwt, Strategy} from 'passport-jwt';
import {UsersService} from '../../users/users.service';

export type JwtPayload = {
    sub: string;
    email: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private readonly usersService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    async validate(payload: JwtPayload): Promise<any> {
        try {
            return await this.usersService.findProfileByUserId(payload.sub);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new UnauthorizedException('User not found or token is invalid.');
            }
            throw error;
        }
    }
}