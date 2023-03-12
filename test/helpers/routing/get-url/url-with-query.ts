
type PaginationQueryType = Partial<{
  searchNameTerm: string
  pageSize: number
}>

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

export const testedFunc = (endpoint: string, {searchNameTerm = null, pageSize = 10}: PaginationQueryType) => {
  let url = `${endpoint}?`
  if (searchNameTerm) {
    url += `searchNameTerm=${searchNameTerm}&`
  }
  if (pageSize){
    url += `pageSize=${pageSize}`
  }
  return url
}
