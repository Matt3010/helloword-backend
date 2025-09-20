import {Controller, Get, Req, Res, UseGuards} from '@nestjs/common';
import {AuthService} from './auth.service';
import {Request, Response} from 'express';
import {AuthGuard} from '@nestjs/passport';
import {JwtAuthGuard} from "./guards/jwt.guard";
import {UserProfile} from "@prisma/client";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) {
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(): Promise<void> {
        // initiates Google OAuth2 login flow
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req: Request, @Res() res: Response): Promise<void> {
        const user: UserProfile = req.user as any;
        const token: string = await this.authService.issueToken(user);
        return res.redirect(`http://localhost:${process.env.FE_PORT}/auth/google/callback?authToken=${token}`);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    me(@Req() req: Request): Promise<UserProfile> {
        const {id} = req.user as any;
        return this.authService.me(id);
    }
}
