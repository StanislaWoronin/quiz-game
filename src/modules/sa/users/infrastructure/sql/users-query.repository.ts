import {Injectable} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {UsersQueryDto} from "../../api/dto/query/users-query.dto";
import {ViewPage} from "../../../../../common/pagination/view-page";
import {ViewUser} from "../../api/view/view-user";
import {BanStatus} from "../../api/dto/query/ban-status";
import { CreatedQuestions } from "../../../questions/api/view/created-questions";
import { UserWithBanInfoDb } from "./pojo/user-with-ban-info.db";
import { toViewUser } from "../../../../../common/data-mapper/to-view-user";

@Injectable()
export class UsersQueryRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    async getUsers(queryDto: UsersQueryDto): Promise<ViewPage<ViewUser>> {
        const filter = this.getFilter(queryDto)

        const query = `
            SELECT u.id, u.login, u.email, u."createdAt",
                   bi."isBanned", bi."banDate", bi."banReason"
              FROM users u
              LEFT JOIN user_ban_info bi
                ON u.id = bi."userId"
                   ${filter}
             ORDER BY "${queryDto.sortBy}" ${queryDto.sortDirection}
             LIMIT ${queryDto.pageSize} OFFSET ${queryDto.skip};         
        `
        console.log(query)
        const users: UserWithBanInfoDb[] = await this.dataSource.query(query)
        const items = users.map(u => toViewUser(u))

        const countQuery = `
            SELECT COUNT(*)
              FROM users u
              LEFT JOIN user_ban_info bi
                ON u.id = bi."userId"
                   ${filter}
        `
        const totalCount = await this.dataSource.query(countQuery)

        return new ViewPage<ViewUser>({
            items: items ?? [],
            query: queryDto,
            totalCount: Number(totalCount[0].count)
        })
    }

    private getFilter(query: UsersQueryDto): string {
        const { banStatus, searchLoginTerm, searchEmailTerm } = query;
        const searchLoginFilter = `u.login ILIKE '%${searchLoginTerm}%'`
        const searchEmailFilter = `u.email ILIKE '%${searchEmailTerm}%'`

        if (banStatus !== BanStatus.All) {
            let banStatusFilter = `WHERE bi.banStatus = ${banStatus}`
            if (searchLoginTerm && searchEmailTerm) {
                return `${banStatusFilter} AND ${searchLoginFilter} OR ${searchEmailFilter}`
            }
            if (searchLoginTerm !== null) {
                return `${banStatusFilter} AND ${searchLoginFilter}`
            }
            if (searchEmailTerm) {
                return `${banStatusFilter} AND ${searchEmailFilter}`
            }
        }
        if (searchLoginTerm && searchEmailTerm) {
            return `WHERE ${searchLoginFilter} OR ${searchEmailFilter}`
        }
        if (searchLoginTerm ?? '') {
            return `WHERE ${searchLoginFilter}`
        }
        if (searchEmailFilter) {
            return `WHERE ${searchEmailFilter}`
        }

        return ''
    }
}