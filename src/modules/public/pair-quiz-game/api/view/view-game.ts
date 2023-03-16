import {Questions} from "../../shared/questions";
import {GameStatus} from "../../shared/game-status";
import {ViewGameProgress} from "./view-game-progress";
import {SqlGame} from "../../infrastructure/sql/entity/sql-game.entity";
import {ViewPlayer} from "./view-player";

export class ViewGame {
    id: string
    firstPlayerProgress: ViewGameProgress
    secondPlayerProgress: ViewGameProgress
    questions: Questions[]
    status: GameStatus
    pairCreatedDate: string
    startGameDate: string
    finishGameDate: string

    constructor(
        game: SqlGame,
        questions: Questions[],
        firstPlayerId: ViewPlayer,
        secondPlayerId?: ViewPlayer,
        status?: GameStatus,
        pairCreatedDate?: string,
        startGameDate?: string,
        finishGameDate?: string
    ) {
        this.id = game.id
        this.firstPlayerProgress = new ViewGameProgress(firstPlayerId)
        this.secondPlayerProgress = new ViewGameProgress(secondPlayerId) ?? null
        this.questions = questions
        this.status = status ?? GameStatus.PendingSecondPlayer
        this.pairCreatedDate = pairCreatedDate ?? new Date().toISOString()
        this.startGameDate = startGameDate ?? null
        this.finishGameDate = finishGameDate ?? null
    }
}