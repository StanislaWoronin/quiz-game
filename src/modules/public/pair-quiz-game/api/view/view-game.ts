import {Questions} from '../../shared/questions';
import {GameStatus} from '../../shared/game-status';
import {ViewGameProgress} from './view-game-progress';
import {SqlGame} from '../../infrastructure/sql/entity/sql-game.entity';
import {ViewPlayer} from './view-player';

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
    status?: GameStatus,
    pairCreatedDate?: string,
    startGameDate?: string,
    finishGameDate?: string,
  ) {
    this.id = game.id;
    this.firstPlayerProgress = firstPlayerProgress;
    this.secondPlayerProgress = secondPlayerId ?? null;
    this.questions = questions ?? null;
    this.status = status ?? GameStatus.PendingSecondPlayer;
    this.pairCreatedDate = pairCreatedDate ?? new Date().toISOString();
    this.startGameDate = startGameDate ?? null;
    this.finishGameDate = finishGameDate ?? null;
  }
}
