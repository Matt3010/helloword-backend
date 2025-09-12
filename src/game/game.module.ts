import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { GameController } from './game.controller';
import { GameRepository } from './game.repository';

@Module({
    imports: [PrismaModule, UsersModule],
    controllers: [GameController],
    providers: [
        GameService,
        GameGateway,
        GameRepository
    ],
})
export class GameModule {}
