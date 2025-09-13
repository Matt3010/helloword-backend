import {Game} from "@prisma/client";

export type SanitizedGame = Omit<Game, 'word'>;
