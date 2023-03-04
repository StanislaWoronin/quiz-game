import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource, getConnection } from "typeorm";

export class TestingRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async deleteAll(): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const entities = getConnection().entityMetadatas;

      for (const entity of entities) {
        const repository = getConnection().getRepository(entity.name); // Get repository
        await repository.clear(); // Clear each entity table's content
      }

      await queryRunner.commitTransaction()
    } catch (e) {
      await queryRunner.rollbackTransaction()
      return false
    } finally {
      await queryRunner.release()
    }

    return true
  }
}