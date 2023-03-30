import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { SqlCredentials } from '../../../sa/users/infrastructure/sql/entity/credentials.entity';
import { ITestingRepository } from '../i-testing.repository';

@Injectable()
export class TestingRepository implements ITestingRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getConfirmationCode(userId: string): Promise<string> {
    const builder = this.dataSource
      .getRepository('sql_email_confirmation')
      .createQueryBuilder('ec')
      .where('ec.userId = :id', { id: userId });
    const result = await builder.getOne();

    return result.confirmationCode;
  }

  async getUserPassword(userId: string): Promise<string> {
    const result = await this.dataSource
      .getRepository(SqlCredentials)
      .createQueryBuilder('c')
      .where('c.userId = :id', { id: userId })
      .getOne();

    return result.credentials;
  }

  async checkUserConfirmed(userId: string) {
    const result = await this.dataSource
      .getRepository('email_confirmation')
      .createQueryBuilder('ec')
      .select('ec.isConfirmed')
      .where('ec.userId = :id', { id: userId })
      .getOne();

    return result;
  }

  async makeExpired(userId: string, expirationDate: string): Promise<boolean> {
    const builder = this.dataSource
      .getRepository('sql_email_confirmation')
      .createQueryBuilder('ec')
      .update()
      .set({ expirationDate })
      .where('userId = :id', { id: userId });
    const result = await builder.execute();

    if (result.affected !== 1) {
      return false;
    }
    return true;
  }

  async deleteAll(): Promise<boolean> {
    try {
      const entities = this.dataSource.entityMetadatas;
      const tableNames = entities
        .map((entity) => `"${entity.tableName}"`)
        .join(', ');

      await this.dataSource.query(`TRUNCATE ${tableNames} CASCADE;`);

      // const queryRunner = this.dataSource.manager.connection.createQueryRunner()
      //
      // await queryRunner.dropSchema('public', false, true);
      // await queryRunner.createSchema('public', true);
      // await this.dataSource.manager.synchronize()
      return true;
    } catch (e) {
      return false;
    }
  }

  async getAllRowCount(): Promise<number> {
    const query = `
      SELECT (xpath('/row/cnt/text()', xml_count))[1]::text::int AS "rowCount"
        FROM (SELECT table_schema, 
              query_to_xml(
                format('select count(*) as cnt from %I.%I', table_schema, table_name),
                false,
                true,
                '') as xml_count
                FROM information_schema.tables
               WHERE table_schema = 'public') t;
    `;
    const result = await this.dataSource.query(query);
    const allRowCount = result.reduce((acc, el) => acc + el.rowCount, 0);

    return allRowCount;
  }
}
