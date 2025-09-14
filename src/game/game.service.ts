import {BadRequestException, Injectable, NotFoundException, OnModuleInit} from '@nestjs/common';
import {UsersService} from '../users/users.service';
import {GameGateway} from './game.gateway';
import {GameRepository} from './game.repository';
import {Game, UserProfile} from '@prisma/client';
import axios, {AxiosResponse} from 'axios';
import {SanitizedGame} from "./entities/sanitized-game";

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
        const game: Game | null = await this.gameRepository.findCurrent();
        if (!game) {
            throw new NotFoundException('Game does not exist');
        }
        const {word, ...sanitizedGame} = game;
        return sanitizedGame;
    }

    private async getFullCurrentGame(): Promise<Game | null> {
        return this.gameRepository.findCurrent();
    }

    public async leaderboard(): Promise<UserProfile[]> {
        return this.usersService.leaderboard();
    }

    private async generateWord(): Promise<string> {
        try {
            const resWord: AxiosResponse<string[]> = await axios.get<string[]>(
                'https://random-word-api.herokuapp.com/word',
                {params: {lang: 'it', number: 1}}
            );

            const word: string | undefined = resWord.data?.[0]?.trim();
            return word || '?';

        } catch (error) {
            console.error('Error getting word:', error);
            return '?';
        }
    }


    public async newRound(): Promise<SanitizedGame> {
        const word: string = await this.generateWord();
        const initial: string = word[0].toUpperCase();
        const game: Game = await this.gameRepository.create(word, initial);
        this.gateway.server.emit('word:new', {initial: game.initial, createdAt: game.createdAt});

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

        // Helper function for normalization
        const normalizeString: (str: string) => string = (str: string): string => {
            return str
                .normalize('NFD') // Decomposes accented characters into base character + accent
                .replace(/[\u0300-\u036f]/g, '') // Removes the accent characters
                .toLowerCase(); // Converts to lowercase
        };

        const normalizedGameWord: string = normalizeString(game.word);
        const normalizedGuessWord: string = normalizeString(guessWord);

        if (normalizedGameWord === normalizedGuessWord) {
            await this.usersService.addScore(userId, 10);
            await this.newRound();
            return {correct: true};
        } else {
            await this.gameRepository.decrementUserAttempts(userId);
            return {correct: false};
        }
    }

    public async resetDailyTries(): Promise<void> {
        const users: UserProfile[] = await this.gameRepository.findAllUserProfiles();

        const resetPromises: Promise<UserProfile>[] = users.map(user => this.resetUserTriesIfNeeded(user));

        await Promise.all(resetPromises);
    }
}
