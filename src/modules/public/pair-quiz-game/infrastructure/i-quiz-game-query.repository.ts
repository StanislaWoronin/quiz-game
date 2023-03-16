import { ViewGame } from '../api/view/view-game';

export interface IQuizGameQueryRepository {
  getMyCurrentGame(userId): Promise<ViewGame>;
  getGameById(gameId): Promise<ViewGame>;
}

export const IQuizGameQueryRepository = 'IQuizGameQueryRepository';
