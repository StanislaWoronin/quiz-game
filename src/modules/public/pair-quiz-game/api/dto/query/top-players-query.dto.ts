import {QueryDto} from "../../../../../../common/pagination/query-parameters/query.dto";
import {IsArray, IsEnum, IsOptional, IsString} from "class-validator";
import {TopPlayersSortField} from "./top-players-sort-field";

export class TopPlayersQueryDto extends QueryDto {
  // @IsEnum(TopPlayersSortField)
  // @IsOptional()
  // sort: TopPlayersSortField | TopPlayersSortField[] = [TopPlayersSortField.AvgScoresDESC, TopPlayersSortField.SumScoreDESC]

  @IsArray()
  @IsOptional()
  sort: string[]
}