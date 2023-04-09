import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NewUserDto } from '../../applications/dto/new-user.dto';
import { CreatedUser } from '../../api/view/created-user';
import { SqlUsers } from './entity/users.entity';
import { SqlCredentials } from './entity/credentials.entity';
import { CreatedUserDb } from './pojo/created-user.db';
import { SqlUserBanInfo } from './entity/ban-info.entity';
import { UpdateUserBanStatusDto } from '../../api/dto/update-user-ban-status.dto';
import { SqlEmailConfirmation } from './entity/sql-email-confirmation.entity';
import { IUsersRepository } from '../i-users.repository';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createUser(
    newUser: NewUserDto,
    hash: string,
    emailConfirmation: SqlEmailConfirmation,
  ): Promise<CreatedUser | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const manager = queryRunner.manager;
    try {
      const createdUser: CreatedUserDb = await manager
        .getRepository(SqlUsers)
        .save(newUser);

      await manager
        .getRepository(SqlCredentials)
        .save(new SqlCredentials(createdUser.id, hash));

      await manager
        .getRepository(SqlEmailConfirmation)
        .save(
          new SqlEmailConfirmation(
            createdUser.id,
            emailConfirmation.isConfirmed,
            emailConfirmation.confirmationCode,
            emailConfirmation.expirationDate,
          ),
        );

      await queryRunner.commitTransaction();
      return new CreatedUser(createdUser.id, createdUser);
    } catch (e) {
      await queryRunner.rollbackTransaction();

      return null;
    } finally {
      await queryRunner.release();
    }
  }

  async updateBanStatus(
    id: string,
    dto: UpdateUserBanStatusDto,
  ): Promise<boolean> {
    const a = await this.dataSource.getRepository(SqlUserBanInfo).upsert(
      {
        userId: id,
        banReason: dto.banReason,
        banDate: new Date().toISOString(),
      },
      ['userId'],
    );

    return true;
  }

  async removeBanStatus(userId: string): Promise<boolean> {
    await this.dataSource.getRepository(SqlUserBanInfo).delete({ userId });

    return true;
  }

  async updateUserPassword(
    userId: string,
    passwordHash: string,
  ): Promise<boolean> {
    const result = await this.dataSource
      .createQueryBuilder()
      .update(SqlUsers)
      .set({ passwordHash })
      .where('id = :id', { id: userId })
      .execute();

    if (result.affected != 1) {
      return false;
    }
    return true;
  }

  async deleteUser(userId: string): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const manager = queryRunner.manager;
    try {
      await this.dataSource.query(this.getQuery('sql_credentials', 'userId'), [
        userId,
      ]);

      await this.dataSource.query(
        this.getQuery('sql_user_ban_info', 'userId'),
        [userId],
      );

      await this.dataSource.query(
        this.getQuery('sql_email_confirmation', 'userId'),
        [userId],
      );

      const result = await this.dataSource.query(
        this.getQuery('sql_users', 'id'),
        [userId],
      );

      if (result[1] !== 1) {
        return false;
      }
      return true;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      return false;
    } finally {
      await queryRunner.release();
    }
  }

  private getQuery(tableName: string, fieldName: string): string {
    return `DELETE 
              FROM ${tableName} CASCADE
             WHERE "${fieldName}" = $1`;
  }
}
