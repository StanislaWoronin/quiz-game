import request from 'supertest';
import { endpoints } from '../routing/routing';
import { getUrlWithId } from '../routing/get-url/url-with-id';

export class Testing {
  constructor(private readonly server: any) {}

  async clearDb(): Promise<number> {
    const response = await request(this.server).delete(
      endpoints.testing.allData,
    );
    console.log(response.status, 'status from delete');
    return response.status;
  }

  async getAllRowCount(): Promise<number> {
    const response = await request(this.server).get(
      endpoints.testing.allRowCount,
    );

    return Number(response.text);
  }

  async getConfirmationCode(userId: string): Promise<string> {
    const url = getUrlWithId(endpoints.testing.confirmationCode, userId);
    const response = await request(this.server).get(url);

    return response.text;
  }

  async getUserPassword(userId: string): Promise<string> {
    const url = getUrlWithId(endpoints.testing.userPassword, userId);
    const response = await request(this.server).get(url);

    return response.text;
  }

  async checkConfirmationStatus(userId: string): Promise<boolean> {
    const url = getUrlWithId(endpoints.testing.isConfirmed, userId);
    const response = await request(this.server).get(url);

    return response.body;
  }

  async makeExpired(userId: string): Promise<string> {
    const url = getUrlWithId(endpoints.testing.setExpirationDate, userId);
    await request(this.server).put(url);

    return;
  }
}
