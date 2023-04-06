import { QueryDto } from '../../../../../../common/pagination/query-parameters/query.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { SortByGameField } from './games-sort-field';

export class GameQueryDto extends QueryDto {
  @IsEnum(SortByGameField)
  @IsOptional()
  sortBy: SortByGameField = SortByGameField.PairCreatedDate;
}
