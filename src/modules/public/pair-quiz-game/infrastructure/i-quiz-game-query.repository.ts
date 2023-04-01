import { ViewGame } from '../api/view/view-game';
import { CheckAnswerProgressDb } from './sql/pojo/checkAnswerProgressDb';
import { PlayerIdDb } from './sql/pojo/player-id.db';
import { GetCorrectAnswerDb } from './sql/pojo/get-correct-answer.db';
import { GameStatus } from '../shared/game-status';

export interface IQuizGameQueryRepository {
  getMyCurrentGame(gameId: string): Promise<ViewGame>;
  getGameById(gameId: string): Promise<ViewGame>;
  getPlayerByGameId(gameId: string): Promise<PlayerIdDb[]>;
  getCorrectAnswers(
    gameId: string,
    questionNumber: number,
  ): Promise<GetCorrectAnswerDb>;
  checkUserCurrentGame(
    userId: string,
    status?: GameStatus,
  ): Promise<string | null>;
  checkOpenGame(): Promise<string | null>;
  currentGameAnswerProgress(userId: string, gameId: string): Promise<number>;
}

export const IQuizGameQueryRepository = 'IQuizGameQueryRepository';
