import { QueryDto } from './query-parameters/query.dto';

export class PageDto<I> {
  items: I[];
  query: QueryDto;
  totalCount: number;
}
