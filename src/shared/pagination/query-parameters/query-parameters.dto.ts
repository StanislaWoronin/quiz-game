import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PublishedStatus } from './published-status';
import { SortByField } from './sort-by-field';
import { Type } from 'class-transformer';
import { SortDirection } from './sort-direction';

export class QueryParametersDto {
  @IsString()
  @IsOptional()
  bodySearchTerm: string = null;

  @IsEnum(PublishedStatus)
  @IsOptional()
  publishedStatus: PublishedStatus = PublishedStatus.All;

  @IsEnum(SortByField)
  @IsOptional()
  sortBy: SortByField = SortByField.CreatedAt;

  @IsEnum(SortDirection)
  @IsOptional()
  sortDirection: SortDirection = SortDirection.Descending;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  pageNumber = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  pageSize = 10;
}
