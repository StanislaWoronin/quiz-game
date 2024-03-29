import { IQuizGameRepository } from '../i-quiz-game.repository';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { MongoQuizGame, QuizGameDocument } from './schema/quiz-game.schema';
import { ClientSession, Connection, Model } from 'mongoose';
import { ViewGame } from '../../api/view/view-game';
import {
  MongoUsers,
  UsersDocument,
} from '../../../../sa/users/infrastructure/mongoose/schema/user.schema';
import { ObjectId } from 'mongodb';
import { ViewGameProgress } from '../../api/view/view-game-progress';
import { GameStatus } from '../../shared/game-status';
import { SendAnswerDto } from '../../applications/dto/send-answer.dto';
import { ViewAnswer } from '../../api/view/view-answer';
import { settings } from '../../../../../settings';
import { DelayedForceGameOverEvent } from '../../applications/dto/delayed-force-game-over.event';
import { SqlUserAnswer } from '../sql/entity/sql-user-answer.entity';
import { Injectable } from '@nestjs/common';
import {
  MongoQuestion,
  QuestionsDocument,
} from '../../../../sa/questions/infrastructure/mongoose/schema/question.schema';
import { Questions } from '../../shared/questions';
import { AnswerStatus } from '../../shared/answer-status';

@Injectable()
export class MQuizGameRepository implements IQuizGameRepository {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(MongoQuizGame.name)
    private quizGameModel: Model<QuizGameDocument>,
    @InjectModel(MongoUsers.name)
    private userModel: Model<UsersDocument>,
    @InjectModel(MongoQuestion.name)
    private questionModel: Model<QuestionsDocument>,
  ) {}

  async createGame(userId: string): Promise<ViewGame> {
    const session: ClientSession = await this.connection.startSession();
    let result: ViewGame = null;

    try {
      await session.withTransaction(async () => {
        const questions = await this.questionModel
          .aggregate([{ $sample: { size: 5 } }])
          .project({ _id: 1, body: 1 })
          .session(session);
        const mappedQuestions = questions.map(
          (q) => new Questions(q._id.toString(), q.body),
        );

        const fistPlayerLogin = await this.userModel
          .findOne({ _id: new ObjectId(userId) })
          .select({ login: 1 })
          .session(session);

        const fistPlayerProgress = new ViewGameProgress(
          userId,
          fistPlayerLogin.login,
        );

        const game = new MongoQuizGame(fistPlayerProgress, mappedQuestions);
        const [createdGame] = await this.quizGameModel.create([game], {
          session,
        });
        result = MongoQuizGame.gameWithId(createdGame);
        return;
      });
    } catch (e) {
      return null;
    } finally {
      await session.endSession();
      return result;
    }
  }

  async joinGame(userId: string, gameId: string): Promise<ViewGame> {
    const session: ClientSession = await this.connection.startSession();
    let result: ViewGame = null;

    try {
      await session.withTransaction(async () => {
        const secondPlayerLogin = await this.userModel
          .findOne({ _id: new ObjectId(userId) })
          .select({ login: 1 })
          .session(session);

        const secondPlayerGameProgress = new ViewGameProgress(
          userId,
          secondPlayerLogin.login,
        );

        const startedGame = await this.quizGameModel.findOneAndUpdate(
          { _id: new ObjectId(gameId) },
          {
            $set: {
              secondPlayerProgress: secondPlayerGameProgress,
              status: GameStatus.Active,
              startGameDate: new Date().toISOString(),
            },
          },
          { new: true, session },
        );

        result = MongoQuizGame.gameWithId(startedGame);
        return;
      });
    } catch (e) {
      return null;
    } finally {
      await session.endSession();
      return result;
    }
  }

  async sendAnswer(dto: SendAnswerDto): Promise<ViewAnswer> {
    const session: ClientSession = await this.connection.startSession();
    let result: ViewAnswer = null;

    try {
      await session.withTransaction(async () => {
        const game = await this.quizGameModel
          .findOne({ _id: new ObjectId(dto.gameId) })
          .session(session);

        const answer = new ViewAnswer(
          dto.questionsId,
          dto.answerStatus,
          new Date().toISOString(),
        );

        const fistPlayer = game.firstPlayerProgress;
        const secondPlayer = game.secondPlayerProgress;

        const score = dto.answerStatus === AnswerStatus.Correct ? 1 : 0;
        const answeredPlayer =
          fistPlayer.player.id === dto.userId ? fistPlayer : secondPlayer;
        answeredPlayer.answers.push(answer);
        answeredPlayer.score += score;

        const fistPlayerAnsweredAllQuestion =
          fistPlayer.answers.length ===
          Number(settings.gameRules.questionsCount);
        const secondPlayerAnsweredAllQuestion =
          secondPlayer.answers.length ===
          Number(settings.gameRules.questionsCount);
        if (
          dto.isLastQuestions &&
          fistPlayerAnsweredAllQuestion &&
          secondPlayerAnsweredAllQuestion
        ) {
          game.status = GameStatus.Finished;
          game.finishGameDate = new Date().toISOString();

          const extraPoint = 1;
          if (fistPlayer.player.id === dto.userId) {
            secondPlayer.score += extraPoint;
          } else {
            fistPlayer.score += extraPoint;
          }

          let winner = fistPlayer;
          let loser = secondPlayer;
          let itDraw = false;
          if (fistPlayer.score < secondPlayer.score) {
            winner = secondPlayer;
            loser = fistPlayer;
          }
          if (fistPlayer.score === secondPlayer.score) {
            itDraw = true;
          }

          if (itDraw) {
            await this.userModel
              .updateMany(
                {
                  _id: {
                    $in: [
                      new ObjectId(winner.player.id),
                      new ObjectId(loser.player.id),
                    ],
                  },
                },
                {
                  $inc: {
                    'statistic.drawsCount': 1,
                    'statistic.gamesCount': 1,
                    'statistic.sumScore': winner.score,
                  },
                },
              )
              .session(session);
          } else {
            await this.userModel
              .updateOne(
                { _id: new ObjectId(winner.player.id) },
                {
                  $inc: {
                    'statistic.winsCount': 1,
                    'statistic.gamesCount': 1,
                    'statistic.sumScore': winner.score,
                  },
                },
              )
              .session(session);
            await this.userModel
              .updateOne(
                { _id: new ObjectId(loser.player.id) },
                {
                  $inc: [
                    { 'statistic.lossesCount': 1 },
                    { 'statistic.gamesCount': 1 },
                    { 'statistic.sumScore': loser.score },
                  ],
                },
              )
              .session(session);
          }
        }

        await game.save({ session });
        result = answer;
        return;
      });
    } catch (e) {
      console.log(e);
      return null;
    } finally {
      await session.endSession();
      return result;
    }
  }

  async forceGameOverSchedule() {
    const session: ClientSession = await this.connection.startSession();

    try {
      await session.withTransaction(async () => {
        const games = await this.quizGameModel.aggregate([
          {
            $match: {
              $or: [
                {
                  'firstPlayerProgress.answers': { $size: 5 },
                  status: GameStatus.Active,
                },
                {
                  'secondPlayerProgress.answers': { $size: 5 },
                  status: GameStatus.Active,
                },
              ],
            },
          },
        ]);

        if (!games.length) return [];

        for (const game of games) {
          const playerAnswerProgress =
            game.firstPlayerProgress.answers.length <
            Number(settings.gameRules.questionsCount)
              ? game.firstPlayerProgress
              : game.secondPlayerProgress;
          const opponent =
            game.firstPlayerProgress.answers.length ===
            Number(settings.gameRules.questionsCount)
              ? game.firstPlayerProgress
              : game.secondPlayerProgress;

          const timeLastOpponentAnswer =
            opponent.answers[Number(settings.gameRules.questionsCount) - 1]
              .addedAt;

          if (
            new Date().getTime() - new Date(timeLastOpponentAnswer).getTime() <
            (Number(settings.gameRules.timeLimit) - 1) * 1000
          ) {
            return;
          }

          const answeredQuestions = playerAnswerProgress.answers.length;
          const unansweredQuestions = game.questions.slice(answeredQuestions);
          const answers = unansweredQuestions.map(
            (q) => new ViewAnswer(q.id, AnswerStatus.Incorrect, null),
          );

          if (
            playerAnswerProgress.player.id ===
            game.firstPlayerProgress.player.id
          ) {
            game.firstPlayerProgress.answers.push(...answers);
          } else {
            game.secondPlayerProgress.answers.push(...answers);
          }
          game.status = GameStatus.Finished;
          game.finishGameDate = new Date().toISOString();

          const extraScore = 1;
          if (opponent.score !== 0) {
            opponent.score += extraScore;
          }

          await this.quizGameModel.updateOne({ _id: game._id }, { $set: game });
        }
        return;
      });
    } catch (e) {
      console.log(e);
    } finally {
      await session.endSession();
      return null;
    }
  }

  // not realise
  async forceGameOverTimeOut(event: DelayedForceGameOverEvent) {
    const session: ClientSession = await this.connection.startSession();

    try {
      await session.withTransaction(async () => {
        const game = await this.quizGameModel.findOne(
          { _id: new ObjectId(event.userId), status: GameStatus.Active },
          null,
          { session },
        );

        const playerAnswerProgress =
          game.firstPlayerProgress.player.id !== event.userId
            ? game.firstPlayerProgress
            : game.secondPlayerProgress;
        const opponent =
          game.firstPlayerProgress.player.id === event.userId
            ? game.firstPlayerProgress
            : game.secondPlayerProgress;

        const unansweredQuestions = game.questions.slice(
          playerAnswerProgress.answers.length - 1,
        );
        const answers = unansweredQuestions.map(
          (q) =>
            new SqlUserAnswer(
              playerAnswerProgress.player.id,
              event.gameId,
              q.id,
              null,
            ),
        );
        playerAnswerProgress.answers.concat(answers);
        game.status = GameStatus.Finished;
        game.finishGameDate = new Date().toISOString();

        const extraScore = 1;
        if (opponent.score !== 0) {
          opponent.score += extraScore;
        }
        await game.save({ session });
      });
    } finally {
      await session.endSession();
      return null;
    }
  }
}
