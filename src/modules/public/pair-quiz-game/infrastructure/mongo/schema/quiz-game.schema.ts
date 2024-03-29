import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { GameStatus } from '../../../shared/game-status';
import {
  ViewGameProgress,
  ViewGameProgressSchema,
} from '../../../api/view/view-game-progress';
import { Questions } from '../../../shared/questions';
import { HydratedDocument } from 'mongoose';
import { WithId } from 'mongodb';
import { ViewGame } from '../../../api/view/view-game';

@Schema({ versionKey: false })
export class MongoQuizGame {
  @Prop({ type: ViewGameProgressSchema })
  firstPlayerProgress: ViewGameProgress;

  @Prop({ type: ViewGameProgressSchema })
  secondPlayerProgress: ViewGameProgress | null;

  @Prop({ array: true })
  questions: Questions[];

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
    questions: Questions[],
    secondPlayerProgress?: ViewGameProgress,
  ) {
    this.firstPlayerProgress = fistPlayerProgress;
    this.secondPlayerProgress = secondPlayerProgress ?? null;
    this.questions = questions;
  }

  static gameWithId(game: WithId<MongoQuizGame>): ViewGame {
    return {
      id: game._id.toString(),
      firstPlayerProgress: game.firstPlayerProgress,
      secondPlayerProgress: game.secondPlayerProgress,
      questions:
        game.status === GameStatus.PendingSecondPlayer ? null : game.questions,
      status: game.status,
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: game.startGameDate,
      finishGameDate: game.finishGameDate,
    };
  }
}

export const QuizGameSchema = SchemaFactory.createForClass(MongoQuizGame);

export type QuizGameDocument = HydratedDocument<MongoQuizGame>;

// QuizGameSchema.pre('save', function (next) {
//   if (this.isNew) {
//     this.__v = 1;
//   } else {
//     this.__v++;
//   }
//   next();
// });
