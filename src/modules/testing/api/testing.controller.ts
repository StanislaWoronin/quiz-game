import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Inject,
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
}
