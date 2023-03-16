import { Inject, Injectable } from '@nestjs/common';
import { ViewGame } from '../api/view/view-game';
import { IQuizGameRepository } from '../infrastructure/i-quiz-game.repository';
import { AnswerDto } from '../api/dto/answer.dto';
import { ViewAnswer } from '../api/view/view-answer';

@Injectable()
export class PairQuizGameService {
  constructor(
    @Inject(IQuizGameRepository)
    protected gameRepository: IQuizGameRepository,
  ) {}

  async joinGame(userId: string): Promise<ViewGame | null> {
    const isPlaying = await this.gameRepository.checkUserCurrentGame(userId);
    if (isPlaying) {
      return null;
    }
    const existsOpenGame = await this.gameRepository.checkOpenGame();
    if (!existsOpenGame) {
      return this.gameRepository.createGame(userId);
    }
    return await this.gameRepository.joinGame(userId);
  }

  async sendAnswer(userId: string, dto: AnswerDto): Promise<ViewAnswer | null> {
    const canAnswer = await this.gameRepository.checkUserGameProgress(userId);
    if (!canAnswer) {
      return null;
    }

    return await this.gameRepository.sendAnswer(userId, dto.answer);
  }
}
