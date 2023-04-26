import { ApiProperty } from '@nestjs/swagger';

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
    return sumScore / gamesCount;
  }
}
