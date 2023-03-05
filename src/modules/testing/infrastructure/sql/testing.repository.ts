import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, getConnection } from 'typeorm';
import { Injectable } from "@nestjs/common";
import { entity } from "../../../../shared/entity";

@Injectable()
export class TestingRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async deleteAll(): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entities = entity;

      for (const entity of [...entities]) {
        // const repository = this.dataSource.getRepository(entity);
        // await repository.clear();
        const query = `
          DELETE FROM ${entity.name.toLowerCase()} CASCADE;
        `
        await this.dataSource.query(query)
      }
      await queryRunner.commitTransaction();

      return false
    } catch (e) {
      await queryRunner.rollbackTransaction();

      return false
    } finally {
      await queryRunner.release();
    }
  }
}
