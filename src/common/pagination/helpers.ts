export const giveSkipNumber = (pageNumber: number, pageSize: number) => {
  return (pageNumber - 1) * pageSize;
};

export const givePagesCount = (totalCount: number, pageSize: number): number => {
  return totalCount != 0 ? Math.ceil(totalCount / pageSize) : 1;
};
