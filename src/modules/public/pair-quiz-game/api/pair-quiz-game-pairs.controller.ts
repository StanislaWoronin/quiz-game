import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Post,
  Query,
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
import { GameStatus } from '../shared/game-status';
import { ViewPage } from '../../../../common/pagination/view-page';
import { GameQueryDto } from './dto/query/game-query.dto';
import { ApiTags } from '@nestjs/swagger';
import {
  ApiGetGameById,
  ApiGetUserCurrentGame,
  ApiGetUserGames,
  ApiJoinGame,
  ApiSendAnswer,
} from '../../../documentations/quiz-game.documentation';

@ApiTags('PairQuizGame')
@UseGuards(AuthBearerGuard)
@Controller('pair-game-quiz/pairs')
export class PairQuizGamePairsController {
  constructor(
    protected gameService: PairQuizGameService,
    @Inject(IQuizGameQueryRepository)
    protected gameQueryRepository: IQuizGameQueryRepository,
  ) {}

  @Post('connection')
  @HttpCode(HttpStatus.OK)
  @ApiJoinGame()
  async joinGame(@UserId() userId: string): Promise<ViewGame> {
    const currentGame = await this.gameQueryRepository.checkUserCurrentGame(
      userId,
    );

    if (currentGame) {
      throw new ForbiddenException();
    }

    return await this.gameService.joinGame(userId);
  }

  @Post('my-current/answers')
  @HttpCode(HttpStatus.OK)
  @ApiSendAnswer()
  async sendAnswer(
    @Body() dto: AnswerDto,
    @UserId() userId: string,
  ): Promise<ViewAnswer> {
    const currentGame = await this.gameQueryRepository.checkUserCurrentGame(
      userId,
      GameStatus.Active,
    );

    if (!currentGame) {
      throw new ForbiddenException();
    }

    const result = await this.gameService.sendAnswer(userId, dto, currentGame);
    if (!result) {
      throw new ForbiddenException(); // if player already answered to all questions
    }

    return result;
  }

  @Get('my')
  @ApiGetUserGames()
  async getMyGames(
    @Query() dto: GameQueryDto,
    @UserId() userId: string,
  ): Promise<ViewPage<ViewGame>> {
    return await this.gameQueryRepository.getMyGames(userId, dto);
  }

  @Get('my-current') // return game witch has status "Active"
  @ApiGetUserCurrentGame()
  async getMyCurrentGame(@UserId() userId: string): Promise<ViewGame> {
    const hasCurrentGame = await this.gameQueryRepository.checkUserCurrentGame(
      userId,
    );
    if (!hasCurrentGame) {
      throw new NotFoundException();
    }

    return await this.gameQueryRepository.getMyCurrentGame(userId);
  }

  @Get(':id') // return game with any status
  @ApiGetGameById()
  async getGameById(
    @Param() gameId: ParamsId,
    @UserId() userId: string,
  ): Promise<ViewGame> {
    const players = await this.gameQueryRepository.getPlayerByGameId(gameId.id);
    if (!players.length) {
      throw new NotFoundException();
    }

    const isPlayer = players.find((el) => el.playerId === userId);
    if (!isPlayer) {
      throw new ForbiddenException();
    }

    return await this.gameQueryRepository.getGameById(userId, gameId.id);
  }
}
