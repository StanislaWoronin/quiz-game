import {Questions} from '../../shared/questions';
import {GameStatus} from '../../shared/game-status';
import {ViewGameProgress} from './view-game-progress';
import {SqlGame} from '../../infrastructure/sql/entity/sql-game.entity';
import {ViewPlayer} from './view-player';

export class ViewGame {
  id: string;
  firstPlayerProgress: ViewGameProgress;
  secondPlayerProgress: ViewGameProgress;
  questions: Questions[] | null;
  status: GameStatus;
  pairCreatedDate: string;
  startGameDate: string;
  finishGameDate: string;

  // private getQuestions(status: GameStatus, questions: Questions[]): Questions[] | null {
  //   if (!status || status === GameStatus.PendingSecondPlayer) {
  //     return null
  //   }
  //   return questions
  // }

  constructor(
    game: SqlGame,
    firstPlayerId: ViewPlayer,
    questions?: Questions[],
    secondPlayerId?: ViewPlayer,
    status?: GameStatus,
    pairCreatedDate?: string,
    startGameDate?: string,
    finishGameDate?: string,
  ) {
    this.id = game.id;
    this.firstPlayerProgress = new ViewGameProgress(firstPlayerId);
    this.secondPlayerProgress = new ViewGameProgress(secondPlayerId) ?? null;
    //this.questions = this.getQuestions(status, questions)
    this.questions = questions ?? null;
    this.status = status ?? GameStatus.PendingSecondPlayer;
    this.pairCreatedDate = pairCreatedDate ?? new Date().toISOString();
    this.startGameDate = startGameDate ?? null;
    this.finishGameDate = finishGameDate ?? null;
  }
}
