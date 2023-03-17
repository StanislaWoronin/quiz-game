import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode, HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { SecurityService } from '../application/security.service';
import { ViewSecurity } from './view/view-security';
import { IQuerySecurityRepository } from '../infrastructure/i-query-security.repository';
import {RefreshTokenValidationGuard} from "../../auth/guards/refresh-token-validation.guard";
import {UserId} from "../../../../common/decorators/user.decorator";
import {DeviceId} from "../../../../common/decorators/device.decorator";

@UseGuards(RefreshTokenValidationGuard)
@Controller('security/devices')
export class SecurityController {
  constructor(
    protected securityService: SecurityService,
    @Inject(IQuerySecurityRepository)
    protected querySecurityRepository: IQuerySecurityRepository,
  ) {}

  @Get()
  async getAllActiveSessions(
    @UserId() userId: string,
  ): Promise<ViewSecurity[]> {
    return await this.querySecurityRepository.getAllActiveSessions(userId);
  }

  @Delete()
  @HttpCode(204)
  async deleteActiveSessions(
      @DeviceId() deviceId: string,
      @UserId() userId: string,
  ) {
    const result = await this.securityService.deleteAllActiveSessions(
      userId,
      deviceId,
    );

    if (!result) {
      throw new NotFoundException();
    }

    return;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteActiveSessionsById(
    @Param('id') deviceId: string,
    @UserId() userId: string,
  ) {
    const userDevice = await this.querySecurityRepository.getDeviseById(
      deviceId,
    );

    if (!userDevice) {
      throw new NotFoundException();
    }

    if (userDevice.userId !== userId) {
      throw new ForbiddenException();
    }

    await this.securityService.deleteDeviceById(deviceId);

    return;
  }
}
