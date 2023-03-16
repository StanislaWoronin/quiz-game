import { ViewGame } from '../api/view/view-game';
import { ViewAnswer } from '../api/view/view-answer';

export interface IQuizGameRepository {
  checkUserCurrentGame(userId: string): Promise<boolean>;
  checkOpenGame(): Promise<string | null>;
  createGame(userId): Promise<ViewGame>;
  joinGame(userId: string): Promise<ViewGame>;
  checkUserGameProgress(userId: string): Promise<boolean>;
  sendAnswer(userId: string, answer: string): Promise<ViewAnswer>;
}

export const IQuizGameRepository = 'IQuizGameRepository';
