import { ViewGame } from '../api/view/view-game';
import { ViewAnswer } from '../api/view/view-answer';
import { SendAnswerDto } from '../applications/dto/send-answer.dto';

export interface IQuizGameRepository {
  createGame(userId): Promise<ViewGame>;
  joinGame(userId: string, gameId: string): Promise<ViewGame>;
  sendAnswer(dto: SendAnswerDto): Promise<ViewAnswer>;
  forceGameOver(userId: string, gameId: string, nextQuestionNumber: number)
}

export const IQuizGameRepository = 'IQuizGameRepository';
