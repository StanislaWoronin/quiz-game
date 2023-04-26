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
import {AnswerStatus} from "../../shared/answer-status";
import {settings} from "../../../../../settings";
import {DelayedForceGameOverEvent} from "../../applications/dto/delayed-force-game-over.event";
import {SqlUserAnswer} from "../sql/entity/sql-user-answer.entity";
import {Injectable} from "@nestjs/common";
import {
    MongoQuestion,
    QuestionsDocument
} from "../../../../sa/questions/infrastructure/mongoose/schema/question.schema";

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
    ) {
    }

    async createGame(userId: string): Promise<ViewGame> {
        const session: ClientSession = await this.connection.startSession();

        try {
            await session.withTransaction(async () => {
                const questions = await this.questionModel.aggregate([
                    { $sample: { size: 5 } },
                ], {session}).project({_id: 1, body: 1})

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
            await session.withTransaction(async () => {
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
            })
        } finally {
            await session.endSession();
            return null;
        }
    }

    async sendAnswer(dto: SendAnswerDto): Promise<ViewAnswer> {
        const session: ClientSession = await this.connection.startSession();

        try {
            await session.withTransaction(async () => {
                const game = await this.quizGameModel.findOne({_id: new ObjectId(dto.gameId)}, null, {session})
                const answer = new ViewAnswer(
                    dto.questionsId,
                    dto.answerStatus,
                    new Date().toISOString()
                )

                const score = dto.answerStatus === AnswerStatus.Correct ? 1 : 0;
                const playerProgress = game.firstPlayerProgress.player.id === dto.userId ? game.firstPlayerProgress : game.secondPlayerProgress;
                playerProgress.answers.push(answer)
                playerProgress.score += score

                if (dto.isLastQuestions && game.firstPlayerProgress.answers.length === Number(settings.gameRules.questionsCount) && game.secondPlayerProgress.answers.length === Number(settings.gameRules.questionsCount)) {
                    game.status = GameStatus.Finished
                    game.finishGameDate = new Date().toISOString()

                    const extraScore = 1
                    const playerScore = game.firstPlayerProgress.player.id === dto.userId ? game.secondPlayerProgress.score : game.firstPlayerProgress.score;
                    if (playerScore != 0) {
                        game.firstPlayerProgress.score += extraScore
                    }
                }

                await game.save({session})

                return answer
            })
        } finally {
            await session.endSession();
            return null;
        }
    }

    async forceGameOverSchedule() {
        const session: ClientSession = await this.connection.startSession();

        try {
            await session.withTransaction(async () => {
                const tenSecondsAgo = new Date(Date.now() - 10 * 1000);

                const games = await this.quizGameModel.aggregate([{
                    $match: {
                        $or: [
                            {
                                'firstPlayerProgress.answers.addedAt': { $lt: tenSecondsAgo },
                                'firstPlayerProgress.answers': { $size: 5 }
                            },
                            {
                                'secondPlayerProgress.answers.addedAt': { $lt: tenSecondsAgo },
                                'secondPlayerProgress.answers': { $size: 5 }
                            }
                        ]
                    }
                }]);

                if (!games.length) return;

                for (const game of games) {
                    const playerAnswerProgress = game.firstPlayerProgress.answers.length !== Number(settings.gameRules.questionsCount) ? game.firstPlayerProgress : game.secondPlayerProgress
                    const opponent = game.firstPlayerProgress.answers.length === settings.gameRules.questionsCount ? game.firstPlayerProgress : game.secondPlayerProgress
                    const unansweredQuestions = game.questions.slice(
                        playerAnswerProgress.answers.length - 1,
                    );
                    const answers = unansweredQuestions.map(
                        (q) =>
                            new SqlUserAnswer(
                                game.secondAnsweredPlayerId,
                                game.gameId,
                                q.id,
                                null,
                            ),
                    );
                    playerAnswerProgress.answers.concat(answers)
                    game.status = GameStatus.Finished
                    game.finishGameDate = new Date().toISOString()

                    const extraScore = 1;
                    if (opponent.score !== 0) {
                        opponent.score += extraScore
                    }
                    await game.save({session})
                }
                return
            })
        } finally {
            await session.endSession();
            return null;
        }
    }

    async forceGameOverTimeOut(event: DelayedForceGameOverEvent) {
        const session: ClientSession = await this.connection.startSession();

        try {
            await session.withTransaction(async () => {
                const game = await this.quizGameModel.findOne({_id: new ObjectId(event.userId), status: GameStatus.Active}, null, {session})

                const playerAnswerProgress = game.firstPlayerProgress.player.id !== event.userId ? game.firstPlayerProgress : game.secondPlayerProgress
                const opponent = game.firstPlayerProgress.player.id === event.userId ? game.firstPlayerProgress : game.secondPlayerProgress

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
                playerAnswerProgress.answers.concat(answers)
                game.status = GameStatus.Finished
                game.finishGameDate = new Date().toISOString()

                const extraScore = 1;
                if (opponent.score !== 0) {
                    opponent.score += extraScore
                }
                await game.save({session})
            })
        } finally {
            await session.endSession();
            return null;
        }
    }
}