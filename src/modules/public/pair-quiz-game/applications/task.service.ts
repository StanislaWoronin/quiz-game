import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IQuizGameQueryRepository } from '../infrastructure/i-quiz-game-query.repository';
import { IQuizGameRepository } from '../infrastructure/i-quiz-game.repository';

@Injectable()
export class TaskService {
  constructor(
    @Inject(IQuizGameQueryRepository)
    protected quizGameQueryRepository: IQuizGameQueryRepository,
    @Inject(IQuizGameRepository)
    protected quizGameRepository: IQuizGameRepository,
  ) {}

  @Cron(CronExpression.EVERY_SECOND, { name: 'delayed_finished_game' })
  async forceGameOver() {
    //await this.quizGameRepository.forceGameOver();
  }
}
