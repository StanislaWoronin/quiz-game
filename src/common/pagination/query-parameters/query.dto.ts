import { giveSkipNumber } from '../../helpers';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { SortDirection } from './sort-direction';
import { Type } from 'class-transformer';

export class QueryDto {
  constructor() {
    Object.defineProperty(this, 'skip', {
      get() {
        return giveSkipNumber(this.pageNumber, this.pageSize);
      },
      set(_val: string) {
        throw Error(`Property "skip" are only getter. Don't set value ${_val}`);
      },
    });
  }

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

  /**
   * Property "skip" are only getter. Don\'t set value
   */
  skip = 0;

  // skip1() {
  //   return giveSkipNumber(this.pageNumber, this.pageSize)
  // }
}
