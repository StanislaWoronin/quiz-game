import {ViewPage} from "../../../src/common/pagination/view-page";

export const expectPagination = <T>(items: T, {
    pagesCount = 1,
    page = 1,
    pageSize = 10,
    totalCount
}): ViewPage<T> => {
    return {}
}