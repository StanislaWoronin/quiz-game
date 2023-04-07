import {QueryDto} from "../../../../../../common/pagination/query-parameters/query.dto";
import {IsEnum, IsOptional} from "class-validator";
import {TopPlayersSortField} from "./top-players-sort-field";

export class TopPlayersQueryDto extends QueryDto {
  @IsEnum(TopPlayersSortField)
  @IsOptional()
  sort: TopPlayersSortField | TopPlayersSortField[]
}