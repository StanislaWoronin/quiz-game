import {Questions} from '../../shared/questions';
import {GameStatus} from '../../shared/game-status';
import {ViewGameProgress} from './view-game-progress';
import {SqlGame} from '../../infrastructure/sql/entity/sql-game.entity';
import {ApiProperty} from '@nestjs/swagger';
import {WithId} from "mongodb";
import {MongoQuizGame} from "../../infrastructure/mongo/schema/quiz-game.schema";

export class ViewGame {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: ViewGameProgress })
  firstPlayerProgress: ViewGameProgress;

  @ApiProperty({ type: ViewGameProgress })
  secondPlayerProgress: ViewGameProgress | null;

  @ApiProperty({ type: [Questions] })
  questions: Questions[] | null;

  @ApiProperty()
  status: GameStatus;

  @ApiProperty({
    example: '2023-04-20T10:45:05.185Z',
  })
  pairCreatedDate: string;

  @ApiProperty({
    example: '2023-04-20T10:45:15.111Z',
  })
  startGameDate: string;

  @ApiProperty({
    example: '2023-04-20T10:50:11.105Z',
  })
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

  static withId(game: WithId<MongoQuizGame>) {
    return {
      id: game._id.toString(),
      firstPlayerProgress: game.firstPlayerProgress,
      secondPlayerProgress: game.secondPlayerProgress,
      questions: game.status === GameStatus.PendingSecondPlayer ? null : game.questions,
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    }
  }
}
