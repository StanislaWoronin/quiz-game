import { Inject, Injectable } from '@nestjs/common';
import { ViewGame } from '../api/view/view-game';
import { IQuizGameRepository } from '../infrastructure/i-quiz-game.repository';
import { AnswerDto } from '../api/dto/answer.dto';
import { ViewAnswer } from '../api/view/view-answer';
import { IQuizGameQueryRepository } from '../infrastructure/i-quiz-game-query.repository';
import { IQuestionsQueryRepository } from '../../../sa/questions/infrastructure/i-questions-query.repository';
import { SendAnswerDto } from './dto/send-answer.dto';
import { settings } from '../../../../settings';
import { EventBus } from '@nestjs/cqrs';

@Injectable()
export class PairQuizGameService {
  constructor(
    protected eventBus: EventBus,
    @Inject(IQuizGameRepository)
    protected gameRepository: IQuizGameRepository,
    @Inject(IQuizGameQueryRepository)
    protected queryGameRepository: IQuizGameQueryRepository,
    @Inject(IQuestionsQueryRepository)
    protected questionsQueryRepository: IQuestionsQueryRepository,
  ) {}

  async joinGame(userId: string): Promise<ViewGame | null> {
    const existsOpenGame = await this.queryGameRepository.checkOpenGame();
    if (!existsOpenGame) {
      return await this.gameRepository.createGame(userId);
    }

    return await this.gameRepository.joinGame(userId, existsOpenGame);
  }

  async sendAnswer(
    userId: string,
    dto: AnswerDto,
    gameId: string,
  ): Promise<ViewAnswer | null> {
    const questionsCount = Number(settings.gameRules.questionsCount);
    const currentUserAnswerProgress =
      await this.queryGameRepository.currentGameAnswerProgress(userId, gameId);
    //console.log(currentUserAnswerProgress, 'how many questions answered');
    if (currentUserAnswerProgress == questionsCount) {
      return null;
    }

    const correctAnswer = await this.queryGameRepository.getCorrectAnswers(
      gameId,
      currentUserAnswerProgress,
    );

    const isLastQuestions = currentUserAnswerProgress == questionsCount - 1;
    const isCorrectAnswer = correctAnswer.correctAnswers.includes(dto.answer);

    const sendAnswerDto = new SendAnswerDto(
      userId,
      dto.answer,
      gameId,
      correctAnswer.questionId,
      isCorrectAnswer,
      isLastQuestions,
    );

    // // TimeOut
    // if (isLastQuestions) {
    //   this.eventBus.publish(new DelayedForceGameOverEvent(userId, gameId));
    // }

    return await this.gameRepository.sendAnswer(sendAnswerDto);
  }
}
