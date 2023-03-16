import request from 'supertest';
import { endpoints } from '../routing/routing';

export class Testing {
  constructor(private readonly server: any) {}

  async clearDb(): Promise<number> {
    const response = await request(this.server).delete(
      endpoints.testing.allData,
    );

    return response.status;
  }

  async getAllRowCount(): Promise<number> {
    const response = await request(this.server).get(
      endpoints.testing.allRowCount,
    );

    return Number(response.text);
  }
}
