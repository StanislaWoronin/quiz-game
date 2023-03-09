export const giveSkipNumber = (pageNumber: number, pageSize: number) => {
    return (pageNumber - 1) * pageSize;
};

export const givePagesCount = (totalCount: number, pageSize: number) => {
    return Math.ceil(totalCount / pageSize);
};