import {Inject, Injectable} from "@nestjs/common";
import {Cron, CronExpression, Timeout} from "@nestjs/schedule";
import {IQuizGameQueryRepository} from "../infrastructure/i-quiz-game-query.repository";
import {IQuizGameRepository} from "../infrastructure/i-quiz-game.repository";
import {CronJob} from "cron";
import {UserId} from "../../../../common/decorators/user.decorator";

@Injectable()
export class TaskService {
    constructor(
        @Inject(IQuizGameQueryRepository)
        protected quizGameQueryRepository: IQuizGameQueryRepository,
        @Inject(IQuizGameRepository)
        protected quizGameRepository: IQuizGameRepository,
    ) {
    }

    // @Cron(CronExpression.EVERY_SECOND, {name: 'delayed_finished_game'})
    // forceGameOver(
    // ) {
    //     console.log('Cron running')
    // }

    // @Timeout('delayedJob',10 * 1000)
    // async handleTimeout(gameId: string, userId: string) {
    //     console.log('start task')
    //     const lastUserAnswerProgress = await this.quizGameQueryRepository.currentGameAnswerProgress(userId, gameId)
    //
    //     if (lastUserAnswerProgress !== 5) {
    //       await this.quizGameRepository.forceGameOver(userId, gameId, lastUserAnswerProgress)
    //     }
    //     console.log('task end')
    //     return
    // }
    //
    // addCronJob(gameId: string, userId: string) {
    //     const job = new CronJob(`10 * * * * *`, async () => {
    //         console.log('start task')
    //         const lastUserAnswerProgress = await this.quizGameQueryRepository.currentGameAnswerProgress(userId, gameId)
    //
    //         if (lastUserAnswerProgress !== 5) {
    //             await this.quizGameRepository.forceGameOver(userId, gameId, lastUserAnswerProgress).then()
    //         }
    //         console.log('task end')
    //         return
    //     })
    // }
}