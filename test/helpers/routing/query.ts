import { PublishedStatus } from '../../../src/modules/sa/questions/api/dto/query/published-status';
import { SortByField } from '../../../src/shared/pagination/query-parameters/sort-by-field';
import { SortDirection } from '../../../src/shared/pagination/query-parameters/sort-direction';

export class Query {
  bodySearchTerm: string | null;
  publishedStatus: PublishedStatus | null;
  sortBy: SortByField | null;
  sortDirection: SortDirection | null;
  pageNumber: number | null;
  pageSize: number | null;
}

export const getQuery = (
  bodySearchTerm: string | null,
  publishedStatus: PublishedStatus | null,
  sortBy: SortByField | null,
  sortDirection: SortDirection | null,
  pageNumber: number | null,
  pageSize: number | null,
) => {
  return {
    bodySearchTerm,
    publishedStatus,
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
  };
};
