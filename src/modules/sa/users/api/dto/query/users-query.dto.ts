import { QueryDto } from '../../../../../../common/pagination/query-parameters/query.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BanStatus } from './ban-status';
import { SortByUserField } from './users-sort-field';
import { SortDirection } from '../../../../../../common/pagination/query-parameters/sort-direction';

export class UsersQueryDto extends QueryDto {
  @IsEnum(BanStatus)
  @IsOptional()
  banStatus: BanStatus = BanStatus.All;

  @IsString()
  @IsOptional()
  searchLoginTerm: string | null;

  @IsString()
  @IsOptional()
  searchEmailTerm: string | null;

  @IsEnum(SortByUserField)
  @IsOptional()
  sortBy: SortByUserField = SortByUserField.CreatedAt;

  @IsEnum(SortDirection)
  @IsOptional()
  sortDirection: SortDirection = SortDirection.Descending;
}
