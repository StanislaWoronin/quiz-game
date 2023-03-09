import {UsersQueryDto} from "../api/dto/query/users-query.dto";
import {ViewPage} from "../../../../shared/pagination/view-page";
import {ViewUser} from "../api/view/view-user";

export interface IUsersQueryRepository {
    getUsers(query: UsersQueryDto): Promise<ViewPage<ViewUser>>
}

export const IUsersQueryRepository = 'IUsersQueryRepository'