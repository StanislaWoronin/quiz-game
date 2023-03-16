import { Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class MTestingRepository {
  constructor(@InjectConnection() private connection: Connection) {}

  async deleteAll(): Promise<boolean> {
    try {
      await this.connection.db.dropDatabase();

      return true;
    } catch (e) {
      return false;
    }
  }

  async getAllRowCount(): Promise<number> {
    const collections = await this.connection.db.collections();

    let totalCount = 0;
    for (const i of collections) {
      const name = i.namespace.split('.')[1];
      const count = await this.connection.db.collection(name).countDocuments();
      totalCount += count;
    }

    return totalCount;
  }
}
