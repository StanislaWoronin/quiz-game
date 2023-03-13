import {CreatedUser} from "../../../src/modules/sa/users/api/view/created-user";
import {CreateUserDto} from "../../../src/modules/sa/users/api/dto/create-user.dto";
import request from "supertest";
import {endpoints} from "../routing/routing";
import {UpdateUserBanStatusDto} from "../../../src/modules/sa/users/api/dto/update-user-ban-status.dto";
import {getUrlForUpdateBanStatus} from "../routing/get-url/users-url";
import {ErrorsMessages} from "../../../src/common/dto/errors-messages";
import {ViewPage} from "../../../src/common/pagination/view-page";
import {ViewUser} from "../../../src/modules/sa/users/api/view/view-user";
import {getUrlWithQuery} from "../routing/get-url/url-with-query";
import { getUrlWithId } from "../routing/get-url/url-with-id";
import {SortByField} from "../../../src/common/pagination/query-parameters/sort-by-field";
import {SortDirection} from "../../../src/common/pagination/query-parameters/sort-direction";
import {PublishedStatus} from "../../../src/modules/sa/questions/api/dto/query/published-status";
import {TestsPaginationType} from "../type/pagination.type";
import {BanStatus} from "../../../src/modules/sa/users/api/dto/query/ban-status";


export class Users {
    constructor(private readonly server: any) {
    }

    async createUser(
        superUser: { login: string; password: string },
        dto: CreateUserDto
    ): Promise<{ body: CreatedUser; status: number }> {
        const response = await request(this.server)
            .post(endpoints.sa.users)
            .auth(superUser.login, superUser.password, {
                type: 'basic',
            })
            .send(dto);

        return { body: response.body, status: response.status };
    }

    async getUsers(
        superUser: { login: string; password: string },
        {
            searchLoginTerm = null,
            searchEmailTerm = null,
            sortBy = SortByField.CreatedAt,
            sortDirection = SortDirection.Descending,
            publishedStatus = PublishedStatus.All,
            banStatus = BanStatus.All,
            pageNumber = 1,
            pageSize = 10,
        }: TestsPaginationType,
    ): Promise<{ body: ViewPage<ViewUser>, status: number }> {
        const query = {
            searchLoginTerm,
            searchEmailTerm,
            sortBy,
            sortDirection,
            publishedStatus,
            banStatus,
            pageNumber,
            pageSize
        }

        const url = getUrlWithQuery(endpoints.sa.users, query)
        const response = await request(this.server)
            .get(url)
            .auth(superUser.login, superUser.password, {
                type: 'basic',
            });

        return { body: response.body, status: response.status };
    }

    async setBanStatus(
        superUser: { login: string; password: string },
        dto: UpdateUserBanStatusDto,
        userId: string
    ): Promise<{ body: ErrorsMessages, status: number }> {
        const url = getUrlForUpdateBanStatus(userId)

        const response = await request(this.server)
            .put(url)
            .auth(superUser.login, superUser.password, {
                type: 'basic'
            })
            .send(dto)

        return { body: response.body, status: response.status };
    }

    async deleteUser(
      superUser: { login: string; password: string },
      userId: string
    ): Promise<number> {
        const url = getUrlWithId(endpoints.sa.users, userId)

        const response = await request(this.server)
          .delete(url)
          .auth(superUser.login, superUser.password, {
              type: 'basic'
          })

        return response.status
    }
}