import {Injectable, Logger} from '@nestjs/common';
import {Cron} from '@nestjs/schedule';
import {GameService} from '../game/game.service';

@Injectable()
export class DailyTriesResetJob {
    private readonly logger: Logger = new Logger(DailyTriesResetJob.name);

    constructor(private readonly gameService: GameService) {
    }

    @Cron('0 0 * * *', {timeZone: 'Europe/Rome'})
    async handleCron() {
        this.logger.log('Resetting daily tries');
        await this.gameService.resetDailyTries();
    }
}