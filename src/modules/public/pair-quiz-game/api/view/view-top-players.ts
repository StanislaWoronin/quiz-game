import { ViewUserStatistic } from './view-user-statistic';
import { ViewPlayer } from './view-player';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { Statistic } from '../../../../sa/users/infrastructure/mongoose/schema/statistic.type';

export class ViewTopPlayers extends ViewUserStatistic {
  @ApiProperty({ type: ViewPlayer })
  player: ViewPlayer;

  static mongoTopPlayer(top: {
    _id: ObjectId;
    login: string;
    statistic: Statistic;
  }) {
    return {
      sumScore: top.statistic.sumScore,
      avgScores:
        this.avg(top.statistic.sumScore, top.statistic.gamesCount) ?? 0,
      gamesCount: top.statistic.gamesCount,
      winsCount: top.statistic.winsCount,
      lossesCount: top.statistic.lossesCount,
      drawsCount: top.statistic.drawsCount,
      player: new ViewPlayer(top._id.toString(), top.login),
    };
  }
}
