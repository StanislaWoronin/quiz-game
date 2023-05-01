import { Inject, Injectable } from '@nestjs/common';
import { IQuizGameQueryRepository } from '../infrastructure/i-quiz-game-query.repository';
import { IQuizGameRepository } from '../infrastructure/i-quiz-game.repository';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TaskService {
  constructor(
    @Inject(IQuizGameQueryRepository)
    protected quizGameQueryRepository: IQuizGameQueryRepository,
    @Inject(IQuizGameRepository)
    protected quizGameRepository: IQuizGameRepository,
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  async forceGameOver() {
    this.quizGameRepository.forceGameOverSchedule();
  }
}
