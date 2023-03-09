import {Injectable} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {UsersQueryDto} from "../../api/dto/query/users-query.dto";
import {ViewPage} from "../../../../../shared/pagination/view-page";
import {ViewUser} from "../../api/view/view-user";
import {BanStatus} from "../../api/dto/query/ban-status";

@Injectable()
export class UsersQueryRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    async getUsers(queryDto: UsersQueryDto): Promise<ViewPage<ViewUser>> {
        const filter = this.getFilter(queryDto)

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
            if (searchLoginTerm) {
                return `${banStatusFilter} AND ${searchLoginFilter}`
            }
            if (searchEmailTerm) {
                return `${banStatusFilter} AND ${searchEmailFilter}`
            }
        }
        if (searchLoginTerm && searchEmailTerm) {
            return `WHERE ${searchLoginFilter} OR ${searchEmailFilter}`
        }
        if (searchLoginTerm) {
            return `WHERE ${searchLoginFilter}`
        }
        if (searchEmailFilter) {
            return `WHERE ${searchEmailFilter}`
        }

        return ''
    }
}