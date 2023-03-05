import request from 'supertest';
import { endpoints } from '../routing/routing';

export class Testing {
  constructor(private readonly server: any) {}

  async clearDb() {
    const response = await request(this.server).delete(
      endpoints.testing.allData,
    );

    return response.status;
  }
}
