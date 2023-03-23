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
    const userGameProgress = await this.queryGameRepository.checkUserGameProgress(userId);
    if (userGameProgress.answers.length !== 4) {
      const currentQuestion = userGameProgress.answers.length + 1;
      const questionsId = userGameProgress.questions[currentQuestion]
      const correctAnswers = await this.questionsQueryRepository.getQuestionAnswers(questionsId)

      const isCorrectAnswer = correctAnswers.includes(dto.answer)

      return await this.gameRepository.sendAnswer(new SendAnswerDto(userId, dto.answer, userGameProgress.gameId, questionsId, isCorrectAnswer));
    }


  }
}
