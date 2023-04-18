import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreatedUser } from '../../api/view/created-user';
import { SqlUsers } from './entity/users.entity';
import { SqlCredentials } from './entity/credentials.entity';
import { SqlUserBanInfo } from './entity/ban-info.entity';
import { UpdateUserBanStatusDto } from '../../api/dto/update-user-ban-status.dto';
import { SqlEmailConfirmation } from './entity/sql-email-confirmation.entity';
import { IUsersRepository } from '../i-users.repository';
import { CreateUserDto } from '../../api/dto/create-user.dto';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createUser(
    dto: CreateUserDto,
    hash: string,
    emailConfirmationDto: SqlEmailConfirmation,
  ): Promise<CreatedUser | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manager = queryRunner.manager;

      const newUser = new SqlUsers(dto.login, dto.email);
      const createdUser = await manager.save(newUser);

      const credential = new SqlCredentials(createdUser.id, hash);
      await manager.save(credential);

      const emailConfirmation = new SqlEmailConfirmation(
        createdUser.id,
        emailConfirmationDto.isConfirmed,
        emailConfirmationDto.confirmationCode,
        emailConfirmationDto.expirationDate,
      );
      await manager.save(emailConfirmation);

      await queryRunner.commitTransaction();
      return new CreatedUser(createdUser);
    } catch (e) {
      await queryRunner.rollbackTransaction();
      console.log(e);
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

    try {
      const manager = queryRunner.manager;
      await manager.query(this.getQuery('sql_credentials', 'userId'), [userId]);

      await manager.query(this.getQuery('sql_user_ban_info', 'userId'), [
        userId,
      ]);

      await manager.query(this.getQuery('sql_email_confirmation', 'userId'), [
        userId,
      ]);

      const result = await manager.query(this.getQuery('sql_users', 'id'), [
        userId,
      ]);

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
