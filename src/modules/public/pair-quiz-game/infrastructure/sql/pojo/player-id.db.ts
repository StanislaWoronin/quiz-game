import {
  MongoQuizGame,
  QuizGameDocument,
} from '../../mongo/schema/quiz-game.schema';
import { WithId } from 'mongodb';

export class PlayerIdDb {
  playerId: string;

  returnPlayers(game: WithId<QuizGameDocument>) {
    return [
      { playerId: game.firstPlayerProgress.player.id },
      { playerId: game.secondPlayerProgress.player.id },
    ];
  }
}
