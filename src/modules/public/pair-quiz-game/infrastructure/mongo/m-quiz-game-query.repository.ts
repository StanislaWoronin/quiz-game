import { Injectable } from '@nestjs/common';
import { IQuizGameQueryRepository } from '../i-quiz-game-query.repository';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { MongoQuizGame, QuizGameDocument } from './schema/quiz-game.schema';
import { ViewPage } from '../../../../../common/pagination/view-page';
import { ViewGame } from '../../api/view/view-game';
import { GameStatus } from '../../shared/game-status';
import { ObjectId } from 'mongodb';
import { PlayerIdDb } from '../sql/pojo/player-id.db';
import { GetCorrectAnswerDb } from '../sql/pojo/get-correct-answer.db';
import {
  MongoQuestion,
  QuestionsDocument,
} from '../../../../sa/questions/infrastructure/mongoose/schema/question.schema';
import { ViewUserStatistic } from '../../api/view/view-user-statistic';
import { TopPlayersQueryDto } from '../../api/dto/query/top-players-query.dto';
import { ViewTopPlayers } from '../../api/view/view-top-players';
import {
  MongoUsers,
  UsersDocument,
} from '../../../../sa/users/infrastructure/mongoose/schema/user.schema';
import { GameQueryDto } from '../../api/dto/query/game-query.dto';

@Injectable()
export class MQuizGameQueryRepository implements IQuizGameQueryRepository {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(MongoQuizGame.name)
    private quizGameModel: Model<QuizGameDocument>,
    @InjectModel(MongoQuestion.name)
    private questionModel: Model<QuestionsDocument>,
    @InjectModel(MongoUsers.name)
    private userModel: Model<UsersDocument>,
  ) {}

  async getMyGames(
    userId: string,
    queryDto: GameQueryDto,
  ): Promise<ViewPage<ViewGame>> {
    const filter = this.getFilter(userId, GameStatus.PendingSecondPlayer);

    const games = await this.quizGameModel
      .find(filter)
      .sort([[queryDto.sortBy, queryDto.sortDirection]])
      //.sort({ [queryDto.sortBy]: queryDto.sortDirection === 'asc' ? 1 : -1 })
      .skip(queryDto.skip)
      .limit(queryDto.pageSize);

    const items = games.map((g) => MongoQuizGame.gameWithId(g));
    const totalCount = await this.quizGameModel.countDocuments(filter);

    return new ViewPage<ViewGame>({
      items,
      query: queryDto,
      totalCount,
    });
  }

  async getMyCurrentGame(userId: string): Promise<ViewGame | null> {
    const filter = this.getFilter(userId, GameStatus.Finished);
    const currentGame = await this.quizGameModel.findOne(filter);

    if (!currentGame) return null;
    return ViewGame.withId(currentGame);
  }

  async getGameById(userId: string, gameId: string): Promise<ViewGame | null> {
    const game = await this.quizGameModel.findOne({
      _id: new ObjectId(gameId),
    });

    if (!game) return null;
    return ViewGame.withId(game);
  }

  async getPlayerByGameId(gameId: string): Promise<PlayerIdDb[]> {
    try {
      const game = await this.quizGameModel
        .findOne({
          _id: new ObjectId(gameId),
        })
        .select({
          _id: 0,
          'firstPlayerProgress.player.id': 1,
          'secondPlayerProgress.player.id': 1,
        });

      if (!game) return [];
      const result = [new PlayerIdDb(game.firstPlayerProgress.player.id)];
      if (game.secondPlayerProgress)
        result.push(new PlayerIdDb(game.secondPlayerProgress.player.id));

      return result;
    } catch (e) {
      console.log(e);
    }
  }

  async getCorrectAnswers(
    gameId: string,
    lastQuestionNumber: number,
  ): Promise<GetCorrectAnswerDb> {
    const [result] = await this.quizGameModel.aggregate([
      { $match: { _id: new ObjectId(gameId) } },
      {
        $project: {
          question: { $arrayElemAt: ['$questions', lastQuestionNumber] },
        },
      },
      {
        $lookup: {
          from: 'mongoquestions',
          let: { questionId: { $toObjectId: '$question.id' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$questionId'] } } },
            { $project: { correctAnswers: 1 } },
          ],
          as: 'questionData',
        },
      },
      {
        $project: {
          _id: 1,
          correctAnswers: { $arrayElemAt: ['$questionData.correctAnswers', 0] },
        },
      },
    ]);

    return {
      questionId: result._id.toString(),
      correctAnswers: result.correctAnswers,
    };
  }

  async getUserStatistic(userId: string): Promise<ViewUserStatistic> {
    const statistic = await this.userModel
      .findOne({ _id: new ObjectId(userId) })
      .select({ _id: 0, statistic: 1 });

    return ViewUserStatistic.mongoStatistic(statistic.statistic);
  }

  async getTopPlayers(
    query: TopPlayersQueryDto,
  ): Promise<ViewPage<ViewTopPlayers>> {
    const sortFilter = this.getSortFilter(query.sort);
    const topPlayers = await this.userModel.aggregate([
      { $sort: sortFilter },
      { $skip: query.skip },
      { $limit: query.pageSize },
      { $project: { _id: 1, login: 1, statistic: 1 } },
    ]);
    const items = topPlayers.map((t) => ViewTopPlayers.mongoTopPlayer(t));
    const totalCount = await this.userModel
      .find({ 'statistic.gamesCount': { $ne: 0 } })
      .countDocuments();

    return new ViewPage({ items, query, totalCount });
  }

  async checkUserCurrentGame(
    userId: string,
    status?: GameStatus,
  ): Promise<string | null> {
    let gameStatusFilter: any = { status: { $ne: GameStatus.Finished } };
    if (status) {
      gameStatusFilter = { status: status };
    }
    const userIdFilter = this.getFilterByUserId(userId);

    const game = await this.quizGameModel.exists({
      $and: [userIdFilter, gameStatusFilter],
    });

    if (!game) return null;
    return game._id.toString();
  }

  async checkOpenGame(): Promise<string | null> {
    const openGame = await this.quizGameModel.findOne({
      status: GameStatus.PendingSecondPlayer,
    });

    if (!openGame) return null;
    return openGame._id.toString();
  }

  async currentGameAnswerProgress(
    userId: string,
    gameId: string,
  ): Promise<number> {
    try {
      const result = await this.quizGameModel
        .findOne({ _id: new ObjectId(gameId) })
        .select({ firstPlayerProgress: 1, secondPlayerProgress: 1 });

      if (result.firstPlayerProgress.player.id === userId) {
        return result.firstPlayerProgress.answers.length;
      }

      return result.secondPlayerProgress.answers.length;
    } catch (e) {
      console.log(e);
    }
  }

  private getSortFilter(sortBy: string | string[]) {
    let parametrs = [];
    if (typeof sortBy === 'string') {
      parametrs.push(sortBy);
    } else {
      parametrs = sortBy;
    }

    const result = {};
    for (const parametr of parametrs) {
      const [field, direction] = parametr.split(' ');
      result[`statistic.${field}`] = direction === 'asc' ? 1 : -1;
    }

    return result;
  }

  private getFilterByUserId(userId: string) {
    return {
      $or: [
        { 'firstPlayerProgress.player.id': userId },
        { 'secondPlayerProgress.player.id': userId },
      ],
    };
  }

  private getFilter(userId: string, status?: GameStatus) {
    const gameStatusFilter = { status: { $ne: status } };

    const filterByUserId = this.getFilterByUserId(userId);
    return {
      $and: [filterByUserId, gameStatusFilter],
    };
  }
}
