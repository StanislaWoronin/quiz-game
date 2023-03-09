import { PublishedStatus } from "../../../src/modules/sa/questions/api/dto/query/published-status";
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
  notPublished_id_asc_1_3: {
    bodySearchTerm: null,
    publishedStatus: PublishedStatus.NotPublished,
    sortBy: SortByField.Body,
    sortDirection: SortDirection.Ascending,
    pageNumber: 1,
    pageSize: 3,
  },
  notPublished_body_desc_2_3: {
    bodySearchTerm: null,
    publishedStatus: PublishedStatus.Published,
    sortBy: SortByField.Body,
    sortDirection: SortDirection.Ascending,
    pageNumber: 2,
    pageSize: 3,
  },
  bodySearchTerm: {
    bodySearchTerm: '1',
    publishedStatus: null,
    sortBy: null,
    sortDirection: null,
    pageNumber: null,
    pageSize: null,
  }
}