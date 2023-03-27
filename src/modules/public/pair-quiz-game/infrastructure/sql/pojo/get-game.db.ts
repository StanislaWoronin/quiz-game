import {GameDb} from "./game.db";
import {AnswerStatus} from "../../../shared/answer-status";

export class GetGameDb extends GameDb {
    answerStatus: AnswerStatus
    addedAt: string
    score: number
} // TODO not used