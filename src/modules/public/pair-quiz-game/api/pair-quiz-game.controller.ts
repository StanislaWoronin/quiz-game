import {
  Body,
  Controller,
  ForbiddenException,
  Inject,
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
    const result = await this.gameService.sendAnswer(userId, dto);
    if (!result) {
      throw new ForbiddenException();
    }

    return result;
  }

  // @HttpCode(HttpStatus.OK)
  // @Get('my-current')
  // async getMyCurrentGame(@UserId() userId: string): Promise<ViewGame> {
  //   return await this.gameQueryRepository.getMyCurrentGame(userId);
  // }
  //
  // @HttpCode(HttpStatus.OK)
  // @Get(':id')
  // async getGameById(
  //   @Param('id') gameId: ParamsId,
  //   @UserId() userId: string,
  // ): Promise<ViewGame> {
  //   const result = await this.gameQueryRepository.getGameById(gameId);
  //   if (!result) {
  //     throw new NotFoundException();
  //   }
  //   if (
  //     result.firstPlayerProgress.player.id !== userId ||
  //     result.secondPlayerProgress?.player.id !== userId
  //   ) {
  //     throw new ForbiddenException();
  //   }
  //
  //   return result;
  // }
}
