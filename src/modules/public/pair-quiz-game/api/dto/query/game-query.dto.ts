import { QueryDto } from '../../../../../../common/pagination/query-parameters/query.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { SortByGameField } from './games-sort-field';
import { SortDirection } from '../../../../../../common/pagination/query-parameters/sort-direction';

export class GameQueryDto extends QueryDto {
  @IsEnum(SortByGameField)
  @IsOptional()
  sortBy: SortByGameField = SortByGameField.PairCreatedDate;

  @IsEnum(SortDirection)
  @IsOptional()
  sortDirection: SortDirection = SortDirection.Descending;
}
