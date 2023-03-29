import {
  Body,
  Controller,
  ForbiddenException, Get, HttpCode, HttpStatus,
  Inject, NotFoundException, Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ViewGame } from './view/view-game';
import { AnswerDto } from './dto/answer.dto';
import { ViewAnswer } from './view/view-answer';
import { PairQuizGameService } from '../applications/pair-quiz-game.service';
import { UserId } from '../../../../common/decorators/user.decorator';
import { AuthBearerGuard } from '../../auth/guards/auth-bearer.guard';
import { IQuizGameQueryRepository } from '../infrastructure/i-quiz-game-query.repository';
import { ParamsId } from '../../../../common/dto/params-id';

@UseGuards(AuthBearerGuard)
@Controller('pair-game-quiz/pair')
export class PairQuizGameController {
  constructor(
    protected gameService: PairQuizGameService,
    @Inject(IQuizGameQueryRepository)
    protected gameQueryRepository: IQuizGameQueryRepository,
  ) {}

  @Post('connection')
  async joinGame(@UserId() userId: string): Promise<ViewGame> {
    const result = await this.gameService.joinGame(userId);
    if (!result) {
      throw new ForbiddenException();
    }

    return result;
  }

  @Post('answers')
  async sendAnswer(
    @Body() dto: AnswerDto,
    @UserId() userId: string,
  ): Promise<ViewAnswer> {
    const currentGame = await this.gameQueryRepository.checkUserCurrentGame(userId)
    if (!currentGame) {
      throw new ForbiddenException();
    }
    const result = await this.gameService.sendAnswer(userId, dto);
    if (!result) {
      throw new ForbiddenException(); // if player already answered to all questions
    }

    return result
  }

  @HttpCode(HttpStatus.OK)
  @Get('my-current') // return game witch has status "Active"
  async getMyCurrentGame(@UserId() userId: string): Promise<ViewGame> {
    const currentGame = await this.gameQueryRepository.checkUserCurrentGame(userId)
    if (!currentGame) {
      throw new NotFoundException();
    }

    return await this.gameQueryRepository.getMyCurrentGame(currentGame);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id') // return the game with any status
  async getGameById(
    @Param() gameId: ParamsId,
    @UserId() userId: string,
  ): Promise<ViewGame> {
    const players = await this.gameQueryRepository.getPlayerByGameId(gameId.id)
    if (!players.length) {
      throw new NotFoundException();
    }

    const isPlayer = players.find(el => el.playerId === userId)
    if (!isPlayer) {
      throw new ForbiddenException();
    }

    return await this.gameQueryRepository.getGameById(gameId.id);
  }
}
