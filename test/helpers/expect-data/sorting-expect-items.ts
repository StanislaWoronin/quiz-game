import {SortByField} from "../../../src/common/pagination/query-parameters/sort-by-field";
import {SortDirection} from "../../../src/common/pagination/query-parameters/sort-direction";

export const getSortingItems = <T>(
    sortBy: SortByField,
    sortDirection: SortDirection,
    item: T[]
) => {
    sortDirection === SortDirection.Ascending ?
        item.sort((first, second) => first[sortBy] - second[sortBy]) :
        item.sort((first, second) => second[sortBy] - first[sortBy])

    return item
}