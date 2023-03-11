export const getUrlWithQuery = <T>(endpoint: string, query: T): string => {
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
