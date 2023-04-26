import {Injectable} from "@nestjs/common";
import {IQuizGameQueryRepository} from "../../i-quiz-game-query.repository";
import {InjectConnection, InjectModel} from "@nestjs/mongoose";
import {Connection, Model} from "mongoose";
import {MongoQuizGame, QuizGameDocument} from "./quiz-game.schema";
import {GameQueryDto} from "../../../api/dto/query/game-query.dto";
import {ViewPage} from "../../../../../../common/pagination/view-page";
import {ViewGame} from "../../../api/view/view-game";
import {GameStatus} from "../../../shared/game-status";
import {ObjectId, WithId} from "mongodb";
import {PlayerIdDb} from "../../sql/pojo/player-id.db";
import {GetCorrectAnswerDb} from "../../sql/pojo/get-correct-answer.db";
import {
    MongoQuestion,
    QuestionsDocument
} from "../../../../../sa/questions/infrastructure/mongoose/schema/question.schema";
import {ViewUserStatistic} from "../../../api/view/view-user-statistic";

@Injectable()
export class MQuizGameQueryRepository implements IQuizGameQueryRepository {
    constructor(
        @InjectConnection() private readonly connection: Connection,
        @InjectModel(MongoQuizGame.name)
        private quizGameModel: Model<QuizGameDocument>,
        @InjectModel(MongoQuestion.name)
        private questionModel: Model<QuestionsDocument>,
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

    async getGameById(userId: string, gameId: string): Promise<ViewGame | null {
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
        const games = await this.quizGameModel.find({
            $and: [
                {
                    $or: [
                        { 'firstPlayerProgress.player.id': userId },
                        { 'secondPlayerProgress.player.id': userId }
                    ]
                },
                { status: { $ne: GameStatus.Finished } }
            ]
        })


    }
}