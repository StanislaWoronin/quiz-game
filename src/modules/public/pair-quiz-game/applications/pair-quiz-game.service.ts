import { Inject, Injectable } from '@nestjs/common';
import { ViewGame } from '../api/view/view-game';
import { IQuizGameRepository } from '../infrastructure/i-quiz-game.repository';
import { AnswerDto } from '../api/dto/answer.dto';
import { ViewAnswer } from '../api/view/view-answer';
import {IQuizGameQueryRepository} from "../infrastructure/i-quiz-game-query.repository";
import {IQuestionsQueryRepository} from "../../../sa/questions/infrastructure/i-questions-query.repository";
import {SendAnswerDto} from "./dto/send-answer.dto";
import { CheckAnswerProgressDb } from "../infrastructure/sql/pojo/checkAnswerProgressDb";
import {util} from "prettier";
import getAlignmentSize = util.getAlignmentSize;

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
    const currentUserAnswerProgress = await this.queryGameRepository.checkUserAnswerProgress(userId);
    if (currentUserAnswerProgress.length === 5) {
      return null
    }

    const correctAnswer = await this.queryGameRepository.getCorrectAnswers(
        userId,
        currentUserAnswerProgress.length
    )

    const isLastQuestions = currentUserAnswerProgress.length === 4 ? true : false
    const isCorrectAnswer = correctAnswer.correctAnswers.includes(dto.answer)

    const sendAnswerDto = new SendAnswerDto(
        userId,
        dto.answer,
        correctAnswer.gameId,
        correctAnswer.questionId,
        isCorrectAnswer,
        isLastQuestions
    )

    return await this.gameRepository.sendAnswer(sendAnswerDto);
  }
}
