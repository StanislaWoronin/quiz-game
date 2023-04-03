import {ViewPage} from "../../../src/common/pagination/view-page";
import {giveSkipNumber} from "../../../src/common/pagination/helpers";

export const expectPagination = <T>(values: T[], {
    pagesCount = 1,
    page = 1,
    pageSize = 10,
    totalCount
}): ViewPage<T> => {
    let items = values
    if(items.length > pageSize) {
        const skip = giveSkipNumber(page, pageSize)
        items = items.slice(skip, skip + pageSize)
    }

    return {
        pagesCount,
        page,
        pageSize,
        totalCount,
        items
    }
}