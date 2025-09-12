// game.controller.ts

import {Controller, Get, Post, Body, Req, UseGuards} from '@nestjs/common';
import {GameService} from './game.service';
import {GuessDto} from '../common/dtos/guess.dto';
import {Request} from 'express';
import {AuthGuard} from "@nestjs/passport"; // Keep this import

@Controller('game')
export class GameController {
    constructor(private readonly gameService: GameService) {
    }

    @UseGuards(AuthGuard('google'))
    @Get('current')
    async current() {
        return this.gameService.getCurrent();
    }

    @UseGuards(AuthGuard('google'))
    @Get('leaderboard')
    async leaderboard() {
        return this.gameService.leaderboard();
    }

    @UseGuards(AuthGuard('google'))
    @Post('guess')
    async guess(@Body() dto: GuessDto, @Req() req: Request) {
        const user = req.user as any;
        console.log(user)
        return await this.gameService.guess(user.id, dto.word);
    }
}