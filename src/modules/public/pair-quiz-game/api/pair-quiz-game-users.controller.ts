import {Controller, Get, Inject, Query, UseGuards,} from '@nestjs/common';
import {UserId} from '../../../../common/decorators/user.decorator';
import {AuthBearerGuard} from '../../auth/guards/auth-bearer.guard';
import {IQuizGameQueryRepository} from '../infrastructure/i-quiz-game-query.repository';
import {ViewPage} from '../../../../common/pagination/view-page';
import {ViewUserStatistic} from "./view/view-user-statistic";
import {TopPlayersQueryDto} from "./dto/query/top-players-query.dto";
import {ViewTopPlayers} from "./view/view-top-players";

@Controller('pair-game-quiz')
export class PairQuizGameUsersController {
  constructor(
    @Inject(IQuizGameQueryRepository)
    protected gameQueryRepository: IQuizGameQueryRepository,
  ) {}

  @UseGuards(AuthBearerGuard)
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
