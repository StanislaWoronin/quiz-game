import { TestsPaginationType } from '../../type/pagination/pagination.type';

export const getUrlWithQuery = <T>(
  endpoint: string,
  query: TestsPaginationType<T>,
): string => {
  let url = `${endpoint}?`;
  for (const key in query) {
    if (query[key]) {
      url += `${key}=${query[key]}&`;
    }
  }

  return url.slice(0, -1);
};
