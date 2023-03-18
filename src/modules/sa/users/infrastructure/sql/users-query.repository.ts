import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UsersQueryDto } from '../../api/dto/query/users-query.dto';
import { ViewPage } from '../../../../../common/pagination/view-page';
import { ViewUser } from '../../api/view/view-user';
import { BanStatus } from '../../api/dto/query/ban-status';
import { UserWithBanInfoDb } from './pojo/user-with-ban-info.db';
import { toViewUser } from '../../../../../common/data-mapper/to-view-user';
import { SqlUsers } from './entity/users.entity';
import {SqlCredentials} from "./entity/credentials.entity";

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {
  }

  async getUsers(queryDto: UsersQueryDto): Promise<ViewPage<ViewUser>> {
    const filter = this.getFilter(queryDto);

    const query = `
            SELECT u.id, u.login, u.email, u."createdAt",
                   bi."isBanned", bi."banDate", bi."banReason"
              FROM sql_users u
              LEFT JOIN sql_user_ban_info bi
                ON u.id = bi."userId"
             ${filter}
             ORDER BY "${queryDto.sortBy}" ${queryDto.sortDirection}
             LIMIT ${queryDto.pageSize} OFFSET ${queryDto.skip};         
        `;
    const users: UserWithBanInfoDb[] = await this.dataSource.query(query);
    const items = users.map((u) => toViewUser(u));

    const countQuery = `
            SELECT COUNT(*)
              FROM sql_users u
              LEFT JOIN sql_user_ban_info bi
                ON u.id = bi."userId"
             ${filter}
        `;
    const totalCount = await this.dataSource.query(countQuery);

    return new ViewPage<ViewUser>({
      items: items ?? [],
      query: queryDto,
      totalCount: Number(totalCount[0].count),
    });
  }

  async getUserByLoginOrEmail(loginOrEmail: string): Promise<SqlUsers | null> {
    const builder = this.dataSource
        .createQueryBuilder()
        .select('u')
        .from(SqlUsers, 'u')
        .where([{ login: loginOrEmail }, { email: loginOrEmail }]);
    const q = builder.getSql()
    console.log(q);
    const result = await builder.getOne();

    return result;
  }

  async getUserById(userId: string): Promise<SqlUsers | null> {
    const builder = this.dataSource
        .createQueryBuilder()
        .select('u')
        .from(SqlUsers, 'u')
        .leftJoin('u.banInfo', 'bi')
        .where('u.id = :id', { id: userId })
        .andWhere('bi.banStatus = :banStatus', { banStatus: false });
    const result = await builder.getOne();

    return result;
  } // TODO new

  async checkUserExists(userId: string): Promise<boolean> {
    return await this.dataSource
      .getRepository('sql_users')
      .createQueryBuilder('u')
      .leftJoin('u.banInfo', 'bi')
      .where('u.id = : id', { id: userId })
      .andWhere('bi.banStatus = :banStatus', { banStatus: false })
      .getExists();
  } // TODO new

  async isLoginOrEmailExist(loginOrEmail: string): Promise<boolean> {
    const builder = this.dataSource
      .createQueryBuilder(SqlUsers, 'u')
      .where([{ login: loginOrEmail }, { email: loginOrEmail }]);
    return await builder.getExists();
  } // TODO new

  async getCredentialByLoginOrEmail(loginOrEmail: string): Promise<SqlCredentials | null> {
    const builder = this.dataSource
        .createQueryBuilder(SqlUsers, 'u')
        .select('u.id', 'id')
        .addSelect('c.credentials', 'credentials')
        .leftJoin(SqlCredentials, 'c')
        .where('u.login = :login', {login: loginOrEmail})
        .orWhere('u.email = :email', {email: loginOrEmail})
    const result = await builder.getOne()

    return result.credentials
  } // TODO new

  private getFilter(query: UsersQueryDto): string {
    const { banStatus, searchLoginTerm, searchEmailTerm } = query;
    const banStatusFilter = this.getBanStatusFilter(banStatus);
    const searTermFilter = this.getSearchTermFilter(
      searchLoginTerm,
      searchEmailTerm,
    );

    if (banStatusFilter && searTermFilter) {
      return `WHERE ${banStatusFilter} AND ${searTermFilter}`;
    }
    if (banStatusFilter) {
      return `WHERE ${banStatusFilter}`;
    }
    if (searTermFilter) {
      return `WHERE ${searTermFilter}`;
    }

    return '';
  }

  private getBanStatusFilter(banStatus: BanStatus): string {
    if (banStatus === BanStatus.NotBanned) {
      return `bi."isBanned" isNull`;
    }
    if (banStatus === BanStatus.Banned) {
      return `bi."isBanned" = true`;
    }
    return '';
  }

  private getSearchTermFilter(
    searchLoginTerm: string,
    searchEmailTerm: string,
  ): string {
    const searchLoginFilter = `u.login ILIKE '%${searchLoginTerm}%'`;
    const searchEmailFilter = `u.email ILIKE '%${searchEmailTerm}%'`;

    if (searchLoginTerm && searchEmailTerm) {
      return `${searchLoginFilter} OR ${searchEmailFilter}`;
    }
    if (searchLoginTerm) {
      return `${searchLoginFilter}`;
    }
    if (searchEmailTerm) {
      return `${searchEmailFilter}`;
    }
    return '';
  }
}
