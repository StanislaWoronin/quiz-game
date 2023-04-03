import { GameStatus } from '../../../shared/game-status';
import { AnswerStatus } from '../../../shared/answer-status';

export class SimpleGameDb {
  id: string;
  status: GameStatus;
  pairCreatedDate: string;
  startGameDate: string;
  finishGameDate: string;
  userId: string;
  login: string;
  questionId: string;
  body: string;
  answerStatus?: AnswerStatus;
  addedAt?: string;
  score?: number;
}
