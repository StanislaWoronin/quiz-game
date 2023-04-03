import { TestsPaginationType } from '../../type/pagination.type';

export const getUrlWithQuery = <T>(
  endpoint: string,
  query: TestsPaginationType<T>,
): string => {
  let result = `${endpoint}?`;
  if (query.searchLoginTerm) {
    result += `searchLoginTerm=${query.searchLoginTerm}&`;
  }
  if (query.searchEmailTerm) {
    result += `searchEmailTerm=${query.searchEmailTerm}&`;
  }
  if (query.bodySearchTerm) {
    result += `bodySearchTerm=${query.bodySearchTerm}&`;
  }
  if (query.banStatus) {
    result += `banStatus=${query.banStatus}&`;
  }
  if (query.publishedStatus) {
    result += `publishedStatus=${query.publishedStatus}&`;
  }
  result += `sortBy=${query.sortBy}&`;
  result += `sortDirection=${query.sortDirection}&`;
  result += `pageNumber=${query.pageNumber}&`;
  result += `pageSize=${query.pageSize}`;

  return result;
};

// export const getUrlWithQuery = <T>(endpoint: string, query: T): string => {
//   let url = endpoint;
//
//   if (Object.keys(query).length) {
//     url += `?`;
//   }
//
//   for (const key in query) {
//     if (query[key]) {
//       url += `${key}=${query[key]}&`;
//     }
//   }
//
//   return url.slice(0, -1);
// };
