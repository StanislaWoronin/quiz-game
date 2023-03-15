import {ViewAnswer} from "../api/view/view-answer";
import {ViewPlayer} from "../api/view/view-player";

export class ConnectionStatus {
    answers: ViewAnswer[]
    player: ViewPlayer
    score: number
}