import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Put,
} from '@nestjs/common';
import { ITestingRepository } from '../infrastructure/i-testing.repository';
import {ApiExcludeEndpoint, ApiOperation, ApiTags} from "@nestjs/swagger";

@ApiTags('Testing')
@Controller('testing')
export class TestingController {
  constructor(
    @Inject(ITestingRepository) protected testingRepository: ITestingRepository,
  ) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('all-data')
  @ApiOperation({summary: 'Clear data base'})
  async deleteAll(): Promise<boolean> {
    return this.testingRepository.deleteAll();
  }

  @Get(`all-row-count`)
  @ApiExcludeEndpoint()
  async getAllRowCount(): Promise<number> {
    return this.testingRepository.getAllRowCount();
  }

  @Get('confirmation-code/:userId')
  @ApiExcludeEndpoint()
  async getConfirmationCode(@Param('userId') userId: string) {
    return await this.testingRepository.getConfirmationCode(userId);
  }

  @Get('user-password/:userId')
  @ApiExcludeEndpoint()
  async getUserPassword(@Param('userId') userId: string) {
    return await this.testingRepository.getUserPassword(userId);
  }

  @Get('is-confirmed/:userId')
  @ApiExcludeEndpoint()
  async checkUserConfirmed(@Param('userId') userId: string) {
    return await this.testingRepository.checkUserConfirmed(userId);
  }

  @Put('set-expiration-date/:userId')
  @HttpCode(204)
  @ApiExcludeEndpoint()
  async makeExpired(@Param('userId') userId: string): Promise<boolean> {
    const expirationDate = new Date(Date.now() - 48 * 1000).toISOString();

    return await this.testingRepository.makeExpired(userId, expirationDate);
  }
}
