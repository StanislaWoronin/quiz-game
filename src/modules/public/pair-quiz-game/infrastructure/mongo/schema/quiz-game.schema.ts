import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { GameStatus } from '../../../shared/game-status';
import { ViewGameProgress } from '../../../api/view/view-game-progress';
import { Questions } from '../../../shared/questions';
import { HydratedDocument } from 'mongoose';
import { WithId } from 'mongodb';
import { ViewGame } from '../../../api/view/view-game';
import { ViewUserStatistic } from '../../../api/view/view-user-statistic';

@Schema({ versionKey: false })
export class MongoQuizGame {
  @Prop({ type: ViewGameProgress })
  firstPlayerProgress: ViewGameProgress;

  @Prop({ type: ViewGameProgress })
  secondPlayerProgress: ViewGameProgress | null;

  @Prop({ type: [Questions], array: true })
  questions: [Questions];

  @Prop({ required: true, default: GameStatus.PendingSecondPlayer })
  status: GameStatus;

  @Prop({ default: new Date().toISOString() })
  pairCreatedDate: string;

  @Prop({ required: false, default: null })
  startGameDate: string;

  @Prop({ required: false, default: null })
  finishGameDate: string;

  constructor(
    fistPlayerProgress: ViewGameProgress,
    questions: [Questions],
    secondPlayerProgress?: ViewGameProgress,
  ) {
    this.firstPlayerProgress = fistPlayerProgress;
    this.secondPlayerProgress = secondPlayerProgress ?? null;
    this.questions = questions;
  }

  static gameWithId(game: WithId<MongoQuizGame>): ViewGame {
    const questions = game.questions.map((q) => {
      return { id: q.id.toString(), body: q.body };
    });
    return {
      id: game._id.toString(),
      firstPlayerProgress: game.firstPlayerProgress,
      secondPlayerProgress: game.secondPlayerProgress,
      questions,
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    };
  }

  // static getUserStatistic(
  //   games: WithId<MongoQuizGame>[],
  //   userId: string,
  // ): ViewUserStatistic {
  //   const userStatistic = new ViewUserStatistic();
  //   for (const game of games) {
  //     const userScore =
  //       game.firstPlayerProgress.player.id === userId
  //         ? game.firstPlayerProgress.score
  //         : game.secondPlayerProgress.score;
  //     const opponentScore =
  //       game.firstPlayerProgress.player.id !== userId
  //         ? game.firstPlayerProgress.score
  //         : game.secondPlayerProgress.score;
  //
  //     if (userScore > opponentScore) userStatistic.winsCount++;
  //     if (userScore < opponentScore) userStatistic.lossesCount++;
  //     if (userScore === opponentScore) userStatistic.drawsCount++;
  //
  //     userStatistic.sumScore += userScore;
  //     userStatistic.gamesCount++;
  //     userStatistic.avgScores = ViewUserStatistic.avg(
  //       userStatistic.sumScore,
  //       userStatistic.gamesCount,
  //     );
  //   }
  //
  //   return userStatistic;
  // }
}

export const QuizGameSchema = SchemaFactory.createForClass(MongoQuizGame);

export type QuizGameDocument = HydratedDocument<MongoQuizGame>;
