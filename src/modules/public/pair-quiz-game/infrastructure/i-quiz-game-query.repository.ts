import { ViewGame } from '../api/view/view-game';
import { CheckGameProgressDb } from "./sql/pojo/checkGameProgressDb";

export interface IQuizGameQueryRepository {
  getMyCurrentGame(userId): Promise<ViewGame>;
  getGameById(gameId): Promise<ViewGame>;
  checkUserCurrentGame(userId: string): Promise<boolean>;
  checkOpenGame(): Promise<string | null>;
  checkUserGameProgress(userId: string): Promise<CheckGameProgressDb>;
}

export const IQuizGameQueryRepository = 'IQuizGameQueryRepository';
