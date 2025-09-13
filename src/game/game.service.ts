import {BadRequestException, Injectable, NotFoundException, OnModuleInit} from '@nestjs/common';
import {UsersService} from '../users/users.service';
import {GameGateway} from './game.gateway';
import {GameRepository} from './game.repository';
import {Game, UserProfile} from '@prisma/client';
import axios from 'axios';
import {SanitizedGame} from "./entities/sanitized-game";

interface OllamaGenerateResponse {
    response: string;
}

@Injectable()
export class GameService implements OnModuleInit {
    constructor(
        private readonly gameRepository: GameRepository,
        private readonly usersService: UsersService,
        private readonly gateway: GameGateway,
    ) {
    }

    async onModuleInit(): Promise<void> {
        const game: Game | null = await this.gameRepository.findCurrent();
        if (!game) {
            await this.gameRepository.create('HelloWord', 'H');
        }
    }

    public async getCurrent(): Promise<SanitizedGame | null> {
        throw new NotFoundException('Game does not exist');
        //
        // const game: Game | null = await this.gameRepository.findCurrent();
        // if (!game) {
        //     throw new NotFoundException('Game does not exist');
        // }
        // const {word, ...sanitizedGame} = game;
        // return sanitizedGame;
    }

    private async getFullCurrentGame(): Promise<Game | null> {
        return this.gameRepository.findCurrent();
    }

    public async leaderboard(): Promise<UserProfile[]> {
        return this.usersService.leaderboard();
    }

    private async generateWord(): Promise<string> {
        if ((process.env.AI_PROVIDER || 'ollama') === 'ollama') {
            const url: string = (process.env.OLLAMA_URL || 'http://localhost:11434') + '/api/generate';
            const improvedPrompt: string = 'Your task is to provide a single, common Italian noun. Respond with only the word itself in lowercase. Do not include any other text, punctuation, or explanations.';

            try {
                const res = await axios.post<OllamaGenerateResponse>(url, {
                    model: 'llama3.2:1b',
                    prompt: improvedPrompt,
                    stream: false
                });

                const word: string = (res.data?.response || '').trim();
                return word || '?';

            } catch (error) {
                console.error('Failed to generate word from Ollama:', error);
                return '?';
            }
        }
        return '?';
    }

    public async newRound(): Promise<SanitizedGame> {
        const word: string = await this.generateWord();
        const initial: string = word[0].toUpperCase();
        const game: Game = await this.gameRepository.create(word, initial);
        this.gateway.server.emit('word:new', {initial: game.initial, createdAt: game.createdAt});

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {word: _, ...sanitizedGame} = game;
        return sanitizedGame;
    }

    private async resetUserTriesIfNeeded(profile: UserProfile): Promise<UserProfile> {
        const now = new Date();
        const lastReset = profile.lastReset || profile.lastLogin || new Date(0);

        if (new Date(lastReset).toDateString() !== now.toDateString()) {
            return this.gameRepository.resetUserAttempts(profile.id, now);
        }
        return profile;
    }

    public async guess(userId: string, guessWord: string): Promise<{ correct: boolean }> {
        if (!userId) {
            throw new BadRequestException('Missing user id');
        }

        let profile: UserProfile = await this.usersService.findProfileByUserId(userId);

        profile = await this.resetUserTriesIfNeeded(profile);

        if (profile.attemptsLeft <= 0) {
            throw new BadRequestException('No attempts left today');
        }

        const game: Game | null = await this.getFullCurrentGame();
        if (!game) {
            throw new BadRequestException('No active game');
        }

        if (game.word.toLowerCase() === guessWord.toLowerCase()) {
            await this.usersService.addScore(userId, 10);
            const newGame: SanitizedGame = await this.newRound();
            this.gateway.server.emit('word:guessed', {winner: userId, newInitial: newGame.initial});
            return {correct: true};
        } else {
            const updatedProfile: UserProfile = await this.gameRepository.decrementUserAttempts(userId);
            this.gateway.server.emit('user:attempt', {userId, attemptsLeft: updatedProfile.attemptsLeft});
            return {correct: false};
        }
    }

    public async resetDailyTries(): Promise<void> {
        const users: UserProfile[] = await this.gameRepository.findAllUserProfiles();

        const resetPromises: Promise<UserProfile>[] = users.map(user => this.resetUserTriesIfNeeded(user));

        await Promise.all(resetPromises);
    }
}
