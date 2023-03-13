import {preparedUser} from "../prepeared-data/prepared-user";
import {CreatedUser} from "../../../src/modules/sa/users/api/view/created-user";
import {SortByField} from "../../../src/common/pagination/query-parameters/sort-by-field";
import {SortDirection} from "../../../src/common/pagination/query-parameters/sort-direction";
import {ViewPage} from "../../../src/common/pagination/view-page";
import {ViewUser} from "../../../src/modules/sa/users/api/view/view-user";
import {BanStatus} from "../../../src/modules/sa/users/api/dto/query/ban-status";
import {getSortingItems} from "./sorting-expect-items";
import {giveSkipNumber} from "../../../src/common/pagination/helpers";

export const expectCreatedUser = (): CreatedUser => {
    return {
        id: expect.any(String),
        login: preparedUser.valid.login,
        email: preparedUser.valid.email,
        createdAt: expect.any(String),
        banInfo: {
            isBanned: false,
            banDate: null,
            banReason: null
        }
    }
};

export const expectResponseForGetUsers = (
    banStatus: BanStatus,
    sortBy: SortByField,
    sortDirection: SortDirection,
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    users: ViewUser[]
): ViewPage<ViewUser> => {
    const sortingUsers = getSortingItems<ViewUser>(sortBy, sortDirection, users)
    const skip = giveSkipNumber(page, pageSize)

    let items = sortingUsers.slice(skip)
    if(skip + pageSize < totalCount) {
        items = sortingUsers.slice(0, skip + pageSize)
    }

    return {
        pagesCount,
        page,
        pageSize,
        totalCount,
        items
    }
}