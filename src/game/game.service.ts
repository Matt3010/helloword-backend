import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { GameGateway } from './game.gateway';
import { GameRepository } from './game.repository';
import { Game } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class GameService {
    constructor(
        private readonly gameRepository: GameRepository,
        private readonly usersService: UsersService,
        private readonly gateway: GameGateway,
    ) {}

    async getCurrent(): Promise<Game | null> {
        return this.gameRepository.findCurrent();
    }

    async leaderboard(): Promise<any> {
        return this.usersService.leaderboard();
    }

    private async generateWord(): Promise<string> {
         if ((process.env.AI_PROVIDER || 'ollama') === 'ollama') {
            const url = (process.env.OLLAMA_URL || 'http://localhost:11434') + '/api/generate';

            // The new, improved prompt
            const improvedPrompt = 'Your task is to provide a single, common Italian noun. Respond with only the word itself in lowercase. Do not include any other text, punctuation, or explanations.';

            try {
                const res = await axios.post(url, {
                    model: 'llama3.2:1b',
                    prompt: improvedPrompt,
                    stream: false
                });

                const word = (res.data?.response || '').trim();
                return word || '?';

            } catch (error) {
                console.error('Failed to generate word from Ollama:', error);
                return '?';
            }
        }
        return '?';
    }

    async newRound(): Promise<Game> {
        const word = await this.generateWord();
        const initial = word[0].toUpperCase();
        const game = await this.gameRepository.create(word, initial);
        this.gateway.server.emit('word:new', { initial: game.initial, createdAt: game.createdAt });
        return game;
    }

    async guess(userId: string, guessWord: string): Promise<{ correct: boolean }> {
        if (!userId) {
            throw new BadRequestException('Missing user id');
        }
        let profile = await this.usersService.findProfileByUserId(userId);
        if (!profile) {
            throw new BadRequestException('User not found');
        }

        const now = new Date();
        const lastReset = profile.lastReset || profile.lastLogin || new Date(0);
        if (new Date(lastReset).toDateString() !== now.toDateString()) {
            profile = await this.gameRepository.resetUserAttempts(userId, now);
        }

        if (profile.attemptsLeft <= 0) {
            throw new BadRequestException('No attempts left today');
        }

        const game = await this.getCurrent();
        if (!game) {
            throw new BadRequestException('No active game');
        }

        // Business logic: check the guess and handle outcomes.
        if (game.word.toLowerCase() === guessWord.toLowerCase()) {
            await this.usersService.addScore(userId, 10);
            const newGame = await this.newRound(); // This already emits 'word:new'
            this.gateway.server.emit('word:guessed', { winner: userId, newInitial: newGame.initial });
            return { correct: true };
        } else {
            const updatedProfile = await this.gameRepository.decrementUserAttempts(userId);
            this.gateway.server.emit('user:attempt', { userId, attemptsLeft: updatedProfile.attemptsLeft });
            return { correct: false };
        }
    }

    async resetDailyTries(): Promise<void> {
        const users = await this.gameRepository.findAllUserProfiles();
        const now = new Date();
        for (const user of users) {
            const lastReset = user.lastReset || user.lastLogin || new Date(0);
            if (new Date(lastReset).toDateString() !== now.toDateString()) {
                await this.gameRepository.resetUserAttempts(user.userId, now);
            }
        }
    }
}
