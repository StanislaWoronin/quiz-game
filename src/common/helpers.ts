export const giveSkipNumber = (pageNumber: number, pageSize: number) => {
  return (pageNumber - 1) * pageSize;
};

export const givePagesCount = (
  totalCount: number,
  pageSize: number,
): number => {
  return totalCount != 0 ? Math.ceil(totalCount / pageSize) : 1;
};

export const getAvgScore = (score: number, gamesCount: number): number => {
  const avg = parseFloat((score / gamesCount).toFixed(2));

  // if (avg - Math.floor(avg) === 0) {
  //   return Math.floor(avg)
  // }
  return avg;
};
