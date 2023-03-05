import { QueryParametersDto } from './query-parameters/query-parameters.dto';

export class PageDto<I> {
  items: I[];
  query: QueryParametersDto;
  totalCount: number;
}
