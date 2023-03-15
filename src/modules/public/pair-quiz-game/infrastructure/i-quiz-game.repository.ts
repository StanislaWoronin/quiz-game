import {ViewGameProgress} from "../api/view/view-game-progress";
import {ViewGame} from "../api/view/view-game";
import {ViewAnswer} from "../api/view/view-answer";

export interface IQuizGameRepository {
    checkUserCurrentGame(userId: string): Promise<boolean>
    joinGame(userId: string): Promise<ViewGameProgress | ViewGame>
    checkUserGameProgress(userId: string): Promise<boolean>
    sendAnswer(userId: string, answer: string): Promise<ViewAnswer>
}

export const IQuizGameRepository = 'IQuizGameRepository'