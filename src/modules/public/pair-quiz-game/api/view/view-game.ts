import { Questions } from '../../shared/questions';
import { GameStatus } from '../../shared/game-status';
import { ViewGameProgress } from './view-game-progress';
import { SqlGame } from '../../infrastructure/sql/entity/sql-game.entity';

export class ViewGame {
  id: string;
  firstPlayerProgress: ViewGameProgress;
  secondPlayerProgress: ViewGameProgress | null;
  questions: Questions[] | null;
  status: GameStatus;
  pairCreatedDate: string;
  startGameDate: string;
  finishGameDate: string;

  constructor(
    game: SqlGame,
    firstPlayerProgress: ViewGameProgress,
    questions?: Questions[],
    secondPlayerId?: ViewGameProgress | null,
  ) {
    this.id = game.id;
    this.firstPlayerProgress = firstPlayerProgress;
    this.secondPlayerProgress = secondPlayerId ?? null;
    this.questions = questions ?? null;
    this.status = game.status ?? GameStatus.PendingSecondPlayer;
    this.pairCreatedDate = game.pairCreatedDate;
    this.startGameDate = game.startGameDate ?? null;
    this.finishGameDate = game.finishGameDate ?? null;
  }
}
