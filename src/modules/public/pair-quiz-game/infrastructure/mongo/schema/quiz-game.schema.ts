import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {GameStatus} from "../../../shared/game-status";
import {ViewGameProgress} from "../../../api/view/view-game-progress";
import {Questions} from "../../../shared/questions";
import {HydratedDocument} from "mongoose";
import {WithId} from "mongodb";
import {ViewGame} from "../../../api/view/view-game";

@Schema({ versionKey: false })
export class MongoQuizGame {
    @Prop({type: ViewGameProgress})
    firstPlayerProgress: ViewGameProgress

    @Prop({type: ViewGameProgress})
    secondPlayerProgress: ViewGameProgress | null

    @Prop({type: [Questions]})
    questions: Questions[] | null;

    @Prop({ required: true, default: GameStatus.PendingSecondPlayer,})
    status: GameStatus;

    @Prop({ default: new Date().toISOString()})
    pairCreatedDate: string;

    @Prop({ required: false, default: null})
    startGameDate: string;

    @Prop({ required: false, default: null})
    finishGameDate: string;

    constructor(fistPlayerProgress: ViewGameProgress, questions: Questions[], secondPlayerProgress?: ViewGameProgress) {
        this.firstPlayerProgress = fistPlayerProgress
        this.secondPlayerProgress = secondPlayerProgress ?? null
        this.questions = questions
    }

    gameWithId(game: WithId<MongoQuizGame>): ViewGame {
        const questions = game.questions.map(q => { return { id: q.id.toString(), body: q.body }})
        return {
            id: game._id.toString(),
            firstPlayerProgress: game.firstPlayerProgress,
            secondPlayerProgress: game.secondPlayerProgress,
            questions,
            status: game.status,
            pairCreatedDate: game.pairCreatedDate,
            startGameDate: game.startGameDate,
            finishGameDate: game.finishGameDate
        }
    }
}

export const QuizGameSchema = SchemaFactory.createForClass(MongoQuizGame);

export type QuizGameDocument = HydratedDocument<MongoQuizGame>;