import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import {SecurityService} from '../application/security.service';
import {ViewSecurity} from './view/view-security';
import {ISecurityQueryRepository} from '../infrastructure/i-security-query.repository';
import {RefreshTokenValidationGuard} from '../../auth/guards/refresh-token-validation.guard';
import {UserId} from '../../../../common/decorators/user.decorator';
import {DeviceId} from '../../../../common/decorators/device.decorator';
import {ApiTags} from "@nestjs/swagger";
import {
  ApiDeleteAllActiveSessions,
  ApiDeleteDeviceById,
  ApiGetAllActiveSessions
} from "../../../documentations/security.documentation";

@ApiTags('Security')
@UseGuards(RefreshTokenValidationGuard)
@Controller('security/devices')
export class SecurityController {
  constructor(
    protected securityService: SecurityService,
    @Inject(ISecurityQueryRepository)
    protected querySecurityRepository: ISecurityQueryRepository,
  ) {}

  @Get()
  @ApiGetAllActiveSessions()
  async getAllActiveSessions(
    @UserId() userId: string,
  ): Promise<ViewSecurity[]> {
    return await this.querySecurityRepository.getAllActiveSessions(userId);
  }

  @Delete()
  @HttpCode(204)
  @ApiDeleteAllActiveSessions()
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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteDeviceById()
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
