import { PublishedStatus } from "../../../src/shared/pagination/query-parameters/published-status";
import { SortByField } from "../../../src/shared/pagination/query-parameters/sort-by-field";
import { SortDirection } from "../../../src/shared/pagination/query-parameters/sort-direction";

export const preparedQuery = {
  onlySearchTerm: {
    bodySearchTerm: '1',
    publishedStatus: null,
    sortBy: null,
    sortDirection: null,
    pageNumber: null,
    pageSize: null,
  },
  published_id_asc_1_3: {
    bodySearchTerm: null,
    publishedStatus: PublishedStatus.Published,
    sortBy: SortByField.Id,
    sortDirection: SortDirection.Ascending,
    pageNumber: 1,
    pageSize: 3,
  },
  notPublished_body_desc_2_3: {
    bodySearchTerm: null,
    publishedStatus: PublishedStatus.Published,
    sortBy: SortByField.Id,
    sortDirection: SortDirection.Ascending,
    pageNumber: 2,
    pageSize: 3,
  }
}