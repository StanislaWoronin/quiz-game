import { Inject, Injectable } from '@nestjs/common';
import { ViewGame } from '../api/view/view-game';
import { IQuizGameRepository } from '../infrastructure/i-quiz-game.repository';
import { AnswerDto } from '../api/dto/answer.dto';
import { ViewAnswer } from '../api/view/view-answer';
import {IQuizGameQueryRepository} from "../infrastructure/i-quiz-game-query.repository";
import {IQuestionsQueryRepository} from "../../../sa/questions/infrastructure/i-questions-query.repository";
import {SendAnswerDto} from "./dto/send-answer.dto";

@Injectable()
export class PairQuizGameService {
  constructor(
    @Inject(IQuizGameRepository)
    protected gameRepository: IQuizGameRepository,
    @Inject(IQuizGameQueryRepository)
    protected queryGameRepository: IQuizGameQueryRepository,
    @Inject(IQuestionsQueryRepository)
    protected questionsQueryRepository: IQuestionsQueryRepository
  ) {}

  async joinGame(userId: string): Promise<ViewGame | null> {
    const isPlaying = await this.queryGameRepository.checkUserCurrentGame(userId);
    if (isPlaying) {
      return null;
    }

    const existsOpenGame = await this.queryGameRepository.checkOpenGame();
    if (!existsOpenGame) {
      return this.gameRepository.createGame(userId);
    }
    return await this.gameRepository.joinGame(userId, existsOpenGame);
  }

  async sendAnswer(userId: string, dto: AnswerDto): Promise<ViewAnswer | null> {
    const currentUserGameProgress = await this.queryGameRepository.checkUserGameProgress(userId);
    if (currentUserGameProgress.answers.length === 4) {
      return null
    }

    const currentQuestion = currentUserGameProgress.answers.length + 1;
    const currentQuestionId = currentUserGameProgress.questions[currentQuestion]
    const currentCorrectAnswers = await this.questionsQueryRepository.getQuestionAnswers(currentQuestionId)
    const isCorrectAnswer = currentCorrectAnswers.includes(dto.answer)

    return await this.gameRepository.sendAnswer(new SendAnswerDto(
        userId, dto.answer, currentUserGameProgress.gameId, currentQuestionId, isCorrectAnswer
    ));
  }
}
