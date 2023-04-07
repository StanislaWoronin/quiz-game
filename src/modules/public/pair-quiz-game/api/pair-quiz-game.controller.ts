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
import { QueryDto } from '../../../../common/pagination/query-parameters/query.dto';
import { GameQueryDto } from './dto/query/game-query.dto';
import {ViewUserStatistic} from "./view/view-user-statistic";
import {TopPlayersQueryDto} from "./dto/query/top-players-query.dto";
import {ViewTopPlayers} from "./view/view-top-players";

@UseGuards(AuthBearerGuard)
@Controller('pair-game-quiz')
export class PairQuizGameController {
  constructor(
    protected gameService: PairQuizGameService,
    @Inject(IQuizGameQueryRepository)
    protected gameQueryRepository: IQuizGameQueryRepository,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('pairs/connection')
  async joinGame(@UserId() userId: string): Promise<ViewGame> {
    const currentGame = await this.gameQueryRepository.checkUserCurrentGame(
      userId,
    );

    if (currentGame) {
      throw new ForbiddenException();
    }

    return await this.gameService.joinGame(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('pairs/my-current/answers')
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

  @Get('pairs/my')
  async getMyGames(
    @Query() dto: GameQueryDto,
    @UserId() userId: string,
  ): Promise<ViewPage<ViewGame>> {
    return await this.gameQueryRepository.getMyGames(userId, dto);
  }

  @Get('pairs/my-current') // return game witch has status "Active"
  async getMyCurrentGame(@UserId() userId: string): Promise<ViewGame> {
    const currentGame = await this.gameQueryRepository.checkUserCurrentGame(
      userId,
    );
    if (!currentGame) {
      throw new NotFoundException();
    }

    return await this.gameQueryRepository.getMyCurrentGame(currentGame);
  }

  @Get('pairs/:id') // return the game with any status
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

    return await this.gameQueryRepository.getGameById(gameId.id);
  }

  @Get('users/my-statistic')
  async getMyStatistic(
      @UserId() userId: string,
  ): Promise<ViewUserStatistic> {
    return await this.gameQueryRepository.getUserStatistic(userId);
  }

  @Get('users/top')
  async getTopPlayers(
      @Query() query: TopPlayersQueryDto
  ): Promise<ViewPage<ViewTopPlayers>> {
    return await this.gameQueryRepository.getTopPlayers(query)
  }
}
