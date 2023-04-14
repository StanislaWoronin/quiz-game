import { ViewPage } from '../../../src/common/pagination/view-page';
import { givePagesCount, giveSkipNumber } from '../../../src/common/helpers';

export const expectPagination = <T>(
  values: T[],
  {
    page = 1,
    pageSize = 10,
    totalCount,
    pagesCount = givePagesCount(totalCount, pageSize),
  },
): ViewPage<T> => {
  let items = values;
  if (items.length > pageSize) {
    const skip = giveSkipNumber(page, pageSize);
    items = items.slice(skip, skip + pageSize);
  }

  return {
    pagesCount,
    page,
    pageSize,
    totalCount,
    items,
  };
};
