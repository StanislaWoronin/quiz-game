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
import { SqlUserBanInfo } from "./entity/ban-info.entity";

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {
  }

  async getUsers(queryDto: UsersQueryDto): Promise<ViewPage<ViewUser>> {
    const filter = this.getFilter(queryDto);

    const query = `
            SELECT u.id, u.login, u.email, u."createdAt",
                   bi."banDate", bi."banReason"
              FROM sql_users u
              LEFT JOIN sql_user_ban_info bi
                ON u.id = bi."userId"
             ${filter}
             ORDER BY "${queryDto.sortBy}" ${queryDto.sortDirection}
             LIMIT ${queryDto.pageSize} OFFSET ${queryDto.skip};         
        `;
    console.log(query)
    const users: UserWithBanInfoDb[] = await this.dataSource.query(query);
    console.log('1', users)
    const items = users.map((u) => toViewUser(u));
    console.log('2', items)
    const countQuery = `
            SELECT COUNT(*)
              FROM sql_users u
              LEFT JOIN sql_user_ban_info bi
                ON u.id = bi."userId"
             ${filter}
        `;
    const totalCount = await this.dataSource.query(countQuery);
    console.log('3', totalCount)
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
    const result = await builder.getOne();

    return result;
  }

  async getUserById(userId: string): Promise<SqlUsers | null> {
    // const builder = this.dataSource
    //     .createQueryBuilder()
    //     .select('u')
    //     .from(SqlUsers, 'u')
    //     .leftJoin('u.banInfo', 'bi')
    //     .where('u.id = :id', { id: userId })
    //     .andWhere('bi.banStatus = :banStatus', { banStatus: false });
    // console.log(builder.getSql());
    // console.log(userId);
    // const result = await builder.getOne();

    const query = `
      SELECT * 
        FROM sql_users u
       WHERE u.id = $1
         AND (NOT EXISTS (SELECT * 
                            FROM sql_user_ban_info bi
                           WHERE bi."userId" = $1));
    `;
    const result = await this.dataSource.query(query, [userId])

    return result[0];
  } // TODO new

  async checkUserExists(userId: string): Promise<boolean> {
    // const builder = this.dataSource
    //   .getRepository('sql_users')
    //   .createQueryBuilder('u')
    //   .leftJoin(SqlUserBanInfo, 'bi')
    //   .where('u.id = : id', { id: userId })
    //   .andWhere('bi.banStatus = :banStatus', { banStatus: false })
    // console.log(builder.getSql());
    // return await builder.getExists();
    const query = `
      SELECT (EXISTS (SELECT * 
                        FROM sql_users u
                       WHERE u.id = $1
                         AND (NOT EXISTS (SELECT * 
                                            FROM sql_user_ban_info bi
                                           WHERE bi."userId" = $1)))) AS exists;
    `
    const result = await this.dataSource.query(query, [userId])

    return result[0].exists
  } // TODO new

  async isLoginOrEmailExist(loginOrEmail: string): Promise<boolean> {
    const builder = this.dataSource
      .createQueryBuilder(SqlUsers, 'u')
      .where([{ login: loginOrEmail }, { email: loginOrEmail }]);
    return await builder.getExists();
  } // TODO new

  async getCredentialByLoginOrEmail(loginOrEmail: string): Promise<SqlCredentials | null> {
    // const builder = this.dataSource
    //     .createQueryBuilder(SqlCredentials, 'c')
    //     .leftJoin(SqlUsers, 'u')
    //     .where('u.login = :loginOrEmail', {loginOrEmail: loginOrEmail})
    //     .orWhere('u.email = :loginOrEmail', {loginOrEmail: loginOrEmail})
    // console.log(builder.getSql()); // TODO не подтягивает зависимость
    // const result = await builder.getOne()
    const query = `
      SELECT c."userId", c.credentials
        FROM sql_users u
        LEFT JOIN sql_credentials c
          ON c."userId" = u.id
       WHERE u.login = $1
          OR u.email = $1
    `
    const result = await this.dataSource.query(query, [loginOrEmail])

    return result[0]
  }

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
      return `bi."banDate" isNull`;
    }
    if (banStatus === BanStatus.Banned) {
      return `bi."banDate" notNull`;
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
