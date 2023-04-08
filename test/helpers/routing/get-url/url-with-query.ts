import { TestsPaginationType } from '../../type/pagination/pagination.type';

export const getUrlWithQuery = <T>(
  endpoint: string,
  query: TestsPaginationType<T>,
): string => {
  let url = `${endpoint}?`;

  for (let key in query) {
    if (Array.isArray(query[key])) {
      for (let val of query[key]) {
        url += `${key}=${val}&`;
      }
    } else {
      url += `${key}=${query[key]}&`;
    }
  }

  // for (const key in query) {
  //   if (query[key]) {
  //     url += `${key}=${query[key]}&`;
  //   }
  // }

  return url.slice(0, -1);
};
