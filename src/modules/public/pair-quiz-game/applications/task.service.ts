import {Inject, Injectable} from "@nestjs/common";
import {Cron, CronExpression, Timeout} from "@nestjs/schedule";
import {IQuizGameQueryRepository} from "../infrastructure/i-quiz-game-query.repository";
import {IQuizGameRepository} from "../infrastructure/i-quiz-game.repository";
import {logger} from "../../../../../test/helpers/helpers";

@Injectable()
export class TaskService {
    constructor(
        @Inject(IQuizGameQueryRepository)
        protected quizGameQueryRepository: IQuizGameQueryRepository,
        @Inject(IQuizGameRepository)
        protected quizGameRepository: IQuizGameRepository,
    ) {
    }

    @Cron(CronExpression.EVERY_SECOND, {name: 'delayed_finished_game'})
    async forceGameOver() {
        console.log(new Date().toISOString())
        const games = await this.quizGameQueryRepository.findGamesWhichNeedComplete(new Date().toISOString());
        console.log(games)
        const fitGames = games.filter(obj => {
            const addedAtDate = Number(new Date(obj.fistPlayerAnsweredTime));
            return Date.now() - addedAtDate >= 10 * 1000
        });

        if (fitGames.length) {
            logger(1)
            for (let game of fitGames) {
                logger(2)
                await this.quizGameRepository.forceGameOver(game.fistAnsweredPlayerId, game.gameId, game.secondPlayerAnswerProgress)
            }
        }
    }
}