import { Query } from '../query';

export const getUrlWithQuery = (endpoint: string, query): string => {
  let url = endpoint;

  if (Object.keys(query).length) {
    url += `?`;
  }

  for (const key in query) {
    if (query[key]) {
      url += `${key}=${query[key]}&`;
    }
  }

  return url.slice(0, -1);
};