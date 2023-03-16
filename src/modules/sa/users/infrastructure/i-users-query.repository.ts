import {UsersQueryDto} from "../api/dto/query/users-query.dto";
import {ViewPage} from "../../../../common/pagination/view-page";
import {ViewUser} from "../api/view/view-user";

export interface IUsersQueryRepository {
    getUsers(query: UsersQueryDto): Promise<ViewPage<ViewUser>>
    checkUserExists(userId: string): Promise<boolean>

    isLoginOrEmailExist(loginOrEmail: string): Promise<boolean>;
}

export const IUsersQueryRepository = 'IUsersQueryRepository'