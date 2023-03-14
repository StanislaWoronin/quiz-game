import {Injectable} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {UsersQueryDto} from "../../api/dto/query/users-query.dto";
import {ViewPage} from "../../../../../common/pagination/view-page";
import {ViewUser} from "../../api/view/view-user";
import {BanStatus} from "../../api/dto/query/ban-status";
import {UserWithBanInfoDb} from "./pojo/user-with-ban-info.db";
import {toViewUser} from "../../../../../common/data-mapper/to-view-user";

@Injectable()
export class UsersQueryRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    async getUsers(queryDto: UsersQueryDto): Promise<ViewPage<ViewUser>> {
        const filter = this.getFilter(queryDto)

        const query = `
            SELECT u.id, u.login, u.email, u."createdAt",
                   bi."isBanned", bi."banDate", bi."banReason"
              FROM sql_users u
              LEFT JOIN sql_user_ban_info bi
                ON u.id = bi."userId"
             ${filter}
             ORDER BY "${queryDto.sortBy}" ${queryDto.sortDirection}
             LIMIT ${queryDto.pageSize} OFFSET ${queryDto.skip};         
        `
        const users: UserWithBanInfoDb[] = await this.dataSource.query(query)
        const items = users.map(u => toViewUser(u))

        const countQuery = `
            SELECT COUNT(*)
              FROM sql_users u
              LEFT JOIN sql_user_ban_info bi
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
        const banStatusFilter = this.getBanStatusFilter(banStatus)
        const searTermFilter = this.getSearchTermFilter(searchLoginTerm, searchEmailTerm)

        if (banStatusFilter && searTermFilter) {
            return `WHERE ${banStatusFilter} AND ${searTermFilter}`
        }
        if (banStatusFilter) {
            return `WHERE ${banStatusFilter}`
        }
        if (searTermFilter) {
            return `WHERE ${searTermFilter}`
        }

        return ''
    }

    private getBanStatusFilter(banStatus: BanStatus): string {
        if (banStatus === BanStatus.All) {
            return ''
        }
        let isBanned
        if (banStatus === BanStatus.NotBanned) {
            isBanned = null
        }
        if (banStatus === BanStatus.Banned) {
            isBanned =  true
        }
        return `bi."isBanned" = ${isBanned}`
    }

    private getSearchTermFilter(searchLoginTerm: string, searchEmailTerm: string): string {
        const searchLoginFilter = `u.login ILIKE '%${searchLoginTerm}%'`
        const searchEmailFilter = `u.email ILIKE '%${searchEmailTerm}%'`

        if (searchLoginTerm && searchEmailTerm) {
            return `${searchLoginFilter} OR ${searchEmailFilter}`
        }
        if (searchLoginTerm) {
            return `${searchLoginFilter}`
        }
        if (searchEmailTerm) {
            return `${searchEmailFilter}`
        }
        return ''
    }
}