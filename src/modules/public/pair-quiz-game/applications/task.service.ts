import {Inject, Injectable} from "@nestjs/common";
import {Timeout} from "@nestjs/schedule";
import {IQuizGameQueryRepository} from "../infrastructure/i-quiz-game-query.repository";
import {IQuizGameRepository} from "../infrastructure/i-quiz-game.repository";

@Injectable()
export class TaskService {
    constructor(
        @Inject(IQuizGameQueryRepository)
        protected quizGameQueryRepository: IQuizGameQueryRepository,
        @Inject(IQuizGameRepository)
        protected quizGameRepository: IQuizGameRepository,
    ) {
    }

    @Timeout('delayedJob',10 * 1000)
    async handleTimeout(gameId: string, userId: string) {
        console.log('start task')
        const lastUserAnswerProgress = await this.quizGameQueryRepository.currentGameAnswerProgress(userId, gameId)

        if (lastUserAnswerProgress !== 5) {
          await this.quizGameRepository.forceGameOver(userId, gameId, lastUserAnswerProgress)
        }
        console.log('task end')
        return
    }
}