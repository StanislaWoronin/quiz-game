import {IQuizGameRepository} from "../i-quiz-game.repository";
import {InjectConnection, InjectModel} from "@nestjs/mongoose";
import {MongoQuizGame, QuizGameDocument} from "./schema/quiz-game.schema";
import {ClientSession, Connection, Model} from "mongoose";
import {ViewGame} from "../../api/view/view-game";
import {MongoUsers, UsersDocument} from "../../../../sa/users/infrastructure/mongoose/schema/user.schema";
import {ObjectId} from "mongodb";
import {ViewGameProgress} from "../../api/view/view-game-progress";
import {GameStatus} from "../../shared/game-status";
import {SendAnswerDto} from "../../applications/dto/send-answer.dto";
import {ViewAnswer} from "../../api/view/view-answer";

export class MQuizGameRepository implements IQuizGameRepository {
    constructor(
        @InjectConnection() private readonly connection: Connection,
        @InjectModel(MongoQuizGame.name)
        private quizGameModel: Model<QuizGameDocument>,
        @InjectModel(MongoUsers.name)
        private userModel: Model<UsersDocument>
    ) {
    }

    async createGame(userId: string): Promise<ViewGame> {
        const session: ClientSession = await this.connection.startSession();

        try {
            await session.withTransaction(async () => {
                const questions = await this.quizGameModel.aggregate([
                    { $sample: { size: 5 } },
                    { $project: { __v: false } }
                ], {session});

                const fistPlayerLogin = await this.userModel
                    .findOne({ _id: new ObjectId(userId)}, {session})
                    .select({ login: 1 })
                console.log(fistPlayerLogin, 'login from createGame')
                // @ts-ignore
                const fistPlayerProgress = new ViewGameProgress(userId, fistPlayerLogin)
                const game = new MongoQuizGame(fistPlayerProgress, questions)
                const createdGame = await this.quizGameModel.create([game], {session})
                console.log(createdGame, 'createGame')
                // @ts-ignore
                return MongoQuizGame.gameWithId(createdGame)
            })
        } finally {
            await session.endSession();
            return null;
        }
    }

    async joinGame(userId: string, gameId: string): Promise<ViewGame> {
        const session: ClientSession = await this.connection.startSession();

        try {
            const secondPlayerLogin = await this.userModel
                .findOne({ _id: new ObjectId(userId)}, null,{session})
                .select({ login: 1 })
            console.log(secondPlayerLogin, 'login from createGame')
            // @ts-ignore
            const secondPlayerGameProgress = new ViewGameProgress(userId, secondPlayerLogin)

            const startedGame = await this.quizGameModel.findOneAndUpdate(
                { _id: new ObjectId(gameId)},
                {$set: {
                    secondPlayerProgress: secondPlayerGameProgress,
                    status: GameStatus.Active,
                    startGameDate: new Date().toISOString()
                }},
                { new: true, session }
            )
            console.log(startedGame, 'joinGame')
            // @ts-ignore
            return MongoQuizGame.gameWithId(startedGame)
        } finally {
            await session.endSession();
            return null;
        }
    }

    async sendAnswer(dto: SendAnswerDto): Promise<ViewAnswer> {

    }
}