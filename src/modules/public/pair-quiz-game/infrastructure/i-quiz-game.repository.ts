import { ViewGame } from '../api/view/view-game';
import { ViewAnswer } from '../api/view/view-answer';
import { SendAnswerDto } from '../applications/dto/send-answer.dto';
import { DelayedForceGameOverEvent } from '../applications/dto/delayed-force-game-over.event';

export interface IQuizGameRepository {
  createGame(userId): Promise<ViewGame>;

  joinGame(userId: string, gameId: string): Promise<ViewGame>;

  sendAnswer(dto: SendAnswerDto): Promise<ViewAnswer>;

  forceGameOverSchedule()
  forceGameOverTimeOut(event: DelayedForceGameOverEvent);
}

export const IQuizGameRepository = 'IQuizGameRepository';
