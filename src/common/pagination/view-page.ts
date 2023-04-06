import { PageDto } from './page.dto';
import { givePagesCount } from '../helpers';

export class ViewPage<I> {
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly pagesCount: number;
  readonly items: I[];

  constructor({ items, query, totalCount }: PageDto<I>) {
    this.page = query.pageNumber;
    this.pageSize = query.pageSize;
    this.totalCount = totalCount;
    this.pagesCount = givePagesCount(this.totalCount, this.pageSize);
    this.items = items;
  }
}
