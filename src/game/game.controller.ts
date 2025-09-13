import {Controller, Get, UseGuards} from '@nestjs/common';
import {GameService} from './game.service';
import {JwtAuthGuard} from "../auth/guards/jwt.guard";
import {SanitizedGame} from "./entities/sanitized-game";
import {UserProfile} from "@prisma/client";

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
}