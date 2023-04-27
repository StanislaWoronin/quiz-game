import {Injectable} from "@nestjs/common";
import {IQuizGameQueryRepository} from "../i-quiz-game-query.repository";
import {InjectConnection, InjectModel} from "@nestjs/mongoose";
import {Connection, Model} from "mongoose";
import {MongoQuizGame, QuizGameDocument} from "./schema/quiz-game.schema";
import {GameQueryDto} from "../../api/dto/query/game-query.dto";
import {ViewPage} from "../../../../../common/pagination/view-page";
import {ViewGame} from "../../api/view/view-game";
import {GameStatus} from "../../shared/game-status";
import {ObjectId, WithId} from "mongodb";
import {PlayerIdDb} from "../sql/pojo/player-id.db";
import {GetCorrectAnswerDb} from "../sql/pojo/get-correct-answer.db";
import {
    MongoQuestion,
    QuestionsDocument
} from "../../../../sa/questions/infrastructure/mongoose/schema/question.schema";
import {ViewUserStatistic} from "../../api/view/view-user-statistic";
import {TopPlayersQueryDto} from "../../api/dto/query/top-players-query.dto";
import {ViewTopPlayers} from "../../api/view/view-top-players";
import {MongoUsers, UsersDocument} from "../../../../sa/users/infrastructure/mongoose/schema/user.schema";

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
    ) {
    }

    async getMyGames(
        userId: string,
        queryDto: GameQueryDto,
    ): Promise<ViewPage<ViewGame>> {
        const myGameFilter = { status: { $ne: GameStatus.PendingSecondPlayer } }
        const games = await this.quizGameModel.find(myGameFilter).skip(queryDto.skip).limit(queryDto.pageSize)
        const totalCount = await this.quizGameModel.countDocuments(myGameFilter)
        // @ts-ignore
        const items = games.map(g => MongoQuizGame.gameWithId(g))

        return new ViewPage<ViewGame>({
            items,
            query: queryDto,
            totalCount,
        });
    }

    async getMyCurrentGame(userId: string): Promise<ViewGame | null> {
        const currentGame = await this.quizGameModel.findOne({
            $and: [
                {
                    $or: [
                        { 'firstPlayerProgress.player.id': userId },
                        { 'secondPlayerProgress.player.id': userId }
                    ]
                },
                { status: { $ne: GameStatus.PendingSecondPlayer } }
            ]
        });
        console.log(currentGame, 'getMyCurrentGame')
        if (!currentGame) return null
        // @ts-ignore
        return MongoQuizGame.gameWithId(currentGame)
    }

    async getGameById(userId: string, gameId: string): Promise<ViewGame | null> {
        const game = await this.quizGameModel.findOne({_id: new ObjectId(gameId)})
        if (!game) return null
        console.log(game, 'game')
        // @ts-ignore
        return MongoQuizGame.gameWithId(game)
    }

    async getPlayerByGameId(gameId: string): Promise<PlayerIdDb[]> {
        const game = await this.quizGameModel.findOne({_id: new ObjectId(gameId)})
        // @ts-ignore
        return PlayerIdDb.returnPlayers(game)
    }

    async getCorrectAnswers(
        gameId: string,
        lastQuestionNumber: number,
    ): Promise<GetCorrectAnswerDb> {
        const game = await this.quizGameModel.findOne({_id: new ObjectId(gameId)})
        const [currentQuestionId] = game.questions.slice(lastQuestionNumber, lastQuestionNumber + 1)
        const currentQuestion = await this.questionModel.findOne({_id: new ObjectId(currentQuestionId.id)})

        const result = await this.quizGameModel.aggregate([
            { $match: { _id: new ObjectId(gameId) } },
            { $project: { currentQuestionId: { $arrayElemAt: ['$questions', lastQuestionNumber] } } },
            { $lookup: { from: 'MongoQuestion', localField: 'currentQuestionId.id', foreignField: '_id', as: 'currentQuestion' } },
            { $unwind: '$currentQuestion' },
            { $limit: 1 }
        ])
        console.log(result, 'testing lookUp')

        return {
            // @ts-ignore
            questionId: currentQuestion.id,
            // @ts-ignore
            correctAnswers: correctAnswers.correctAnswers
        }
    }

    async getUserStatistic(userId: string): Promise<ViewUserStatistic> {
        const statistic = await this.userModel
            .findOne({_id: new ObjectId(userId)})
            .select({statistic: 1})
        // @ts-ignore
        return statistic
    }

    async getTopPlayers(
      query: TopPlayersQueryDto,
    ): Promise<ViewPage<ViewTopPlayers>> {
        // const statistic = await this.quizGameModel.aggregate([
        //     {
        //         $project: {
        //             firstPlayerId: "$firstPlayerProgress.player.id",
        //             secondPlayerId: "$secondPlayerProgress.player.id",
        //             firstPlayerScore: "$firstPlayerProgress.score",
        //             secondPlayerScore: "$secondPlayerProgress.score",
        //         },
        //     }
        // ]) // TODO
        const sortFilter = this.getSortFilter(query.sort)
        const topPlayers = await this.userModel.aggregate([
            { $sort: sortFilter },
            { $skip: query.skip },
            { $limit: query.pageSize },
        ])
        console.log(topPlayers, 'getTopPlayers')
        // @ts-ignore
        return topPlayers
    }

    async checkUserCurrentGame(
      userId: string,
      status?: GameStatus,
    ): Promise<string | null> {
        let filter = {}
        if (status) {
            filter = {status: status}
        }
        const game = await this.quizGameModel.findOne({
            $and: [
                {
                    $or: [
                        { 'firstPlayerProgress.player.id': userId },
                        { 'secondPlayerProgress.player.id': userId }
                    ]
                },
                filter
            ]
        })
        console.log(game, 'checkUserCurrentGame')
        // @ts-ignore
        return game
    }

    async checkOpenGame(): Promise<string | null> {
        const openGame = await this.quizGameModel.findOne({status: GameStatus.PendingSecondPlayer})
        console.log(openGame, 'checkOpenGame')
        // @ts-ignore
        return openGame
    }

    async currentGameAnswerProgress(
        userId: string,
        gameId: string,
    ): Promise<number> {
        const result = await this.quizGameModel.findOne({_id: new ObjectId(gameId)}).select({firstPlayerProgress: 1, secondPlayerProgress: 1})
        if (result.firstPlayerProgress.player.id === userId) {
            return result.firstPlayerProgress.answers.length
        }
        return result.secondPlayerProgress.answers.length
    }

    private getSortFilter(sortBy: string | string[]) {
        let parametrs = [];
        if (typeof sortBy === 'string') {
            parametrs.push(sortBy);
        } else {
            parametrs = sortBy;
        }

        let result = {}
        for (const parametr of parametrs) {
            const [field, direction] = parametr.split(' ');
            result[field] = direction === 'asc' ? 1 : -1
        }

        return result;
    }
}