import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject, Param, Put,
} from '@nestjs/common';
import { ITestingRepository } from '../infrastructure/i-testing.repository';

@Controller('testing')
export class TestingController {
  constructor(
    @Inject(ITestingRepository) protected testingRepository: ITestingRepository,
  ) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('all-data')
  async deleteAll(): Promise<boolean> {
    return this.testingRepository.deleteAll();
  }

  @Get(`all-row-count`)
  async getAllRowCount(): Promise<number> {
    return this.testingRepository.getAllRowCount();
  }

  @Get('confirmation-code/:userId')
  async getConfirmationCode(@Param('userId') userId: string) {
    return await this.testingRepository.getConfirmationCode(userId);
  }

  @Get('is-confirmed/:userId')
  async checkUserConfirmed(@Param('userId') userId: string) {
    return await this.testingRepository.checkUserConfirmed(userId);
  }

  @Put('set-expiration-date/:userId')
  @HttpCode(204)
  async makeExpired(@Param('userId') userId: string): Promise<boolean> {
    const expirationDate = new Date(Date.now() - 48 * 1000).toISOString();

    return await this.testingRepository.makeExpired(userId, expirationDate);
  }
}
