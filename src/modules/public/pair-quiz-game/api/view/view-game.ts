import {ConnectionStatus} from "../../shared/connection-status";
import {Questions} from "../../shared/questions";
import {GameStatus} from "../../shared/game-status";

export class ViewGame {
    id: string
    firstPlayerProgress: ConnectionStatus
    secondPlayerProgress: ConnectionStatus
    questions: Questions[]
    status: GameStatus
    pairCreatedDate: string
    startGameDate: string
    finishGameDate: string
}