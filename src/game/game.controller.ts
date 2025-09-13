import {Body, Controller, Get, Post, Req, UseGuards} from '@nestjs/common';
import {GameService} from './game.service';
import {JwtAuthGuard} from "../auth/guards/jwt.guard";
import {SanitizedGame} from "./entities/sanitized-game";
import {UserProfile} from "@prisma/client";
import {GuessDto} from "../common/dtos/guess.dto";
import {Request} from 'express';

@Controller('game')
export class GameController {
    constructor(
        private readonly gameService: GameService,
    ) {
    }

    @UseGuards(JwtAuthGuard)
    @Get('current')
    async current(): Promise<SanitizedGame | null> {
        return this.gameService.getCurrent();
    }

    @UseGuards(JwtAuthGuard)
    @Get('leaderboard')
    async leaderboard(): Promise<UserProfile[]> {
        return this.gameService.leaderboard();
    }

    @UseGuards(JwtAuthGuard)
    @Post('guess')
    async guess(@Body() dto: GuessDto, @Req() req: Request): Promise<{ correct: boolean }> {
        const user = req.user as any;
        return this.gameService.guess(user.id, dto.word);
    }
}