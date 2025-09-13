import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.enableCors({
        origin: 'http://localhost:4200', // L'origine del tuo frontend
        credentials: true, // Fondamentale per permettere l'invio dei cookie di sessione
    });
    app.setGlobalPrefix('api');
  await app.listen(process.env.PORT || 4000);
}
bootstrap();
