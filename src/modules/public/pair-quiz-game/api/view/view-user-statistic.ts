import { ApiProperty } from '@nestjs/swagger';
import { Statistic } from '../../../../sa/users/infrastructure/mongoose/schema/statistic.type';

export class ViewUserStatistic {
  @ApiProperty()
  sumScore: number;
  @ApiProperty()
  avgScores: number;
  @ApiProperty()
  gamesCount: number;
  @ApiProperty()
  winsCount: number;
  @ApiProperty()
  lossesCount: number;
  @ApiProperty()
  drawsCount: number;

  static avg(sumScore, gamesCount): number {
    const avg = sumScore / gamesCount;
    if (Math.floor(avg) !== avg) {
      return Number(avg.toFixed(2));
    }
    return avg;
  }

  static mongoStatistic(stat: Statistic): ViewUserStatistic {
    return {
      sumScore: stat.sumScore,
      avgScores: this.avg(stat.sumScore, stat.gamesCount) ?? 0,
      gamesCount: stat.gamesCount,
      winsCount: stat.winsCount,
      lossesCount: stat.lossesCount,
      drawsCount: stat.drawsCount,
    };
  }
}
