import { ViewUserStatistic } from './view-user-statistic';
import { ViewPlayer } from './view-player';
import { ApiProperty } from '@nestjs/swagger';

export class ViewTopPlayers extends ViewUserStatistic {
  @ApiProperty({ type: ViewPlayer })
  player: ViewPlayer;
}
