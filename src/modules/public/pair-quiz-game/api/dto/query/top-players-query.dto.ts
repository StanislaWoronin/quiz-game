import { QueryDto } from '../../../../../../common/pagination/query-parameters/query.dto';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { TopPlayersSortField } from './top-players-sort-field';
import { IsValidEnumValue } from '../../../../../../common/validators/is-valid-enum-value.validator';
import { ApiProperty } from '@nestjs/swagger';

export class TopPlayersQueryDto extends QueryDto {
  // @IsEnum(TopPlayersSortField)
  // @IsOptional()
  // sort: TopPlayersSortField | TopPlayersSortField[] = [TopPlayersSortField.AvgScoresDESC, TopPlayersSortField.SumScoreDESC]
  @ApiProperty()
  @Validate(IsValidEnumValue, [TopPlayersSortField])
  @IsOptional()
  sort: TopPlayersSortField | TopPlayersSortField[] = [
    TopPlayersSortField.AvgScoresDESC,
    TopPlayersSortField.SumScoreDESC,
  ];
}
