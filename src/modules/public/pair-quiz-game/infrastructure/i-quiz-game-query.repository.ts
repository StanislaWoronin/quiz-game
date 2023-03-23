import { ViewGame } from '../api/view/view-game';
import {UserGameProgress} from "./sql/pojo/user-game-progress";

export interface IQuizGameQueryRepository {
  // getMyCurrentGame(userId): Promise<ViewGame>;
  // getGameById(gameId): Promise<ViewGame>;
  checkUserCurrentGame(userId: string): Promise<boolean>;
  checkOpenGame(): Promise<string | null>;
  checkUserGameProgress(userId: string): Promise<UserGameProgress>;
}

export const IQuizGameQueryRepository = 'IQuizGameQueryRepository';
