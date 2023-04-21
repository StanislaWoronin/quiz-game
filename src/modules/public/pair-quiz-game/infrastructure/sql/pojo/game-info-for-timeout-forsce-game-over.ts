import {GameStatus} from "../../../shared/game-status";

export class GameInfoForTimeoutForceGameOver {
    gameStatus: GameStatus;
    countAnsweredQuestions: number;
    playerIdWithoutAnswers: string;
    scoreFistAnsweredPlayer: number;
    questions: string[];
}