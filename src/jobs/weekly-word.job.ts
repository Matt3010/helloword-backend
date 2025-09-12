import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { GameService } from '../game/game.service';

@Injectable()
export class WeeklyWordJob {
  private readonly logger = new Logger(WeeklyWordJob.name);
  constructor(private readonly gameService: GameService) {}

  // run at Monday 00:00
  @Cron('0 0 * * 1')
  async handleCron() {
    this.logger.log('Creating weekly word');
    await this.gameService.newRound();
  }
}
