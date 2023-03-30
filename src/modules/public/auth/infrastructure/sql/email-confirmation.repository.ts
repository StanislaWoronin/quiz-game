import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SqlEmailConfirmation } from '../../../../sa/users/infrastructure/sql/entity/sql-email-confirmation.entity';

@Injectable()
export class EmailConfirmationRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getEmailConfirmationByCode(
    code: string,
  ): Promise<SqlEmailConfirmation | null> {
    const builder = this.dataSource
      .createQueryBuilder()
      .select('ec.userId', 'userId')
      .addSelect('ec.confirmationCode', 'confirmationCode')
      .addSelect('ec.expirationDate', 'expirationDate')
      .addSelect('ec.isConfirmed', 'isConfirmed')
      .from(SqlEmailConfirmation, 'ec')
      .where('ec.confirmationCode = :code', { code: code });
    return await builder.getRawOne();
  }

  async checkConfirmation(userId: string): Promise<boolean | null> {
    const builder = this.dataSource
      .createQueryBuilder()
      .select('ec.isConfirmed', 'isConfirmed')
      .from(SqlEmailConfirmation, 'ec')
      .where('ec.userId = :id', { id: userId });
    const status = await builder.getRawOne();

    if (!status) {
      return null;
    }
    return status.isConfirmed;
  }

  async updateConfirmationInfo(confirmationCode: string): Promise<boolean> {
    const result = await this.dataSource
      .createQueryBuilder()
      .update(SqlEmailConfirmation)
      .set({
        isConfirmed: true,
      })
      .where('confirmationCode = :code', { code: confirmationCode })
      .execute();

    if (result.affected != 1) {
      return false;
    }
    return true;
  }

  async updateConfirmationCode(
    userId: string,
    confirmationCode: string,
    expirationDate: string,
  ): Promise<boolean> {
    const builder = this.dataSource
      .createQueryBuilder()
      .update(SqlEmailConfirmation)
      .set({
        confirmationCode,
        expirationDate,
      })
      .where('userId = :id', { id: userId });
    const result = await builder.execute();

    if (result.affected != 1) {
      return false;
    }
    return true;
  }

  async deleteEmailConfirmationById(userId: string): Promise<boolean> {
    const result = await this.dataSource
      .createQueryBuilder()
      .delete()
      .from(SqlEmailConfirmation)
      .where('userId = :id', { id: userId })
      .execute();

    if (result.affected != 1) {
      return false;
    }
    return true;
  }
}
