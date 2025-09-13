import { IsString, Length } from 'class-validator';

export class GuessDto {
    @IsString()
    @Length(1, 255)
    word!: string;
}