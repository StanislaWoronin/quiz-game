import { ApiProperty } from '@nestjs/swagger';
import {WithId} from "mongodb";
import {MongoQuizGame} from "../../infrastructure/mongo/schema/quiz-game.schema";

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
}
