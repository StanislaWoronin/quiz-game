import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { DelayedForceGameOverEvent } from '../applications/dto/delayed-force-game-over.event';
import { Inject } from '@nestjs/common';
import { IQuizGameRepository } from '../infrastructure/i-quiz-game.repository';
import { sleep } from '../../../../../test/helpers/helpers';
import { settings } from '../../../../settings';

@EventsHandler(DelayedForceGameOverEvent)
export class DelayedForceGameOverHandler
  implements IEventHandler<DelayedForceGameOverEvent>
{
  constructor(
    @Inject(IQuizGameRepository)
    protected gameRepository: IQuizGameRepository,
  ) {}

  async handle(event: DelayedForceGameOverEvent) {
    await sleep(Number(settings.gameRules.timeLimit));

    this.gameRepository.forceGameOverTimeOut(event);
    //this.gameRepository.forceGameOverSchedule();
    return;
  }
}
