import { QueryDto } from '../../../../../../common/pagination/query-parameters/query.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { SortByGameField } from './games-sort-field';
import { SortDirection } from '../../../../../../common/pagination/query-parameters/sort-direction';
import { ApiProperty } from '@nestjs/swagger';

export class GameQueryDto extends QueryDto {
  @ApiProperty({ default: SortByGameField.PairCreatedDate, required: false })
  @IsEnum(SortByGameField)
  @IsOptional()
  sortBy: SortByGameField = SortByGameField.PairCreatedDate;

  @ApiProperty({ default: SortDirection.Descending, required: false })
  @IsEnum(SortDirection)
  @IsOptional()
  sortDirection: SortDirection = SortDirection.Descending;
}
