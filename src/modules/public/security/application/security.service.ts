import { Inject, Injectable } from '@nestjs/common';
import { ISecurityRepository } from '../infrastructure/i-security.repository';
import { ISecurityQueryRepository } from '../infrastructure/i-security-query.repository';
import { JwtService } from '../../auth/applications/jwt.service';
import { Tokens } from '../../../../common/dto/tokens';
import { TokenPayload } from '../../../../common/dto/token-payload';
import { randomUUID } from 'crypto';
import { SqlSecurity } from '../infrastructure/sql/entity/security';

@Injectable()
export class SecurityService {
  constructor(
    protected jwtService: JwtService,
    @Inject(ISecurityRepository)
    protected securityRepository: ISecurityRepository,
    @Inject(ISecurityQueryRepository)
    protected querySecurityRepository: ISecurityQueryRepository,
  ) {}

  // async getDeviceById(deviceId: string): Promise<SqlSecurity | null> {
  //   const device = await this.querySecurityRepository.getDeviseById(deviceId);
  //
  //   if (!device) {
  //     return null;
  //   }
  //
  //   return device;
  // }  // TODO delete

  async createUserDevice(
    userId: string,
    title: string,
    ipAddress: string,
  ): Promise<Tokens> {
    const deviceId = randomUUID();
    const token = await this.jwtService.createTokens(userId, deviceId);

    const tokenPayload = await this.jwtService.getTokenPayload(
      token.refreshToken,
    );

    const userDevice = new SqlSecurity(
      tokenPayload.userId,
      tokenPayload.deviceId,
      title,
      ipAddress,
      new Date(tokenPayload.iat).toISOString(),
      new Date(tokenPayload.exp).toISOString(),
    );

    await this.securityRepository.createUserDevice(userDevice);
    return token;
  }

  async createNewRefreshToken(refreshToken: string) {
    await this.jwtService.addTokenInBlackList(refreshToken);
    const tokenPayload = await this.jwtService.getTokenPayload(refreshToken);
    const token = await this.jwtService.createTokens(
      tokenPayload.userId,
      tokenPayload.deviceId,
    );
    const newTokenPayload = await this.jwtService.getTokenPayload(
      token.refreshToken,
    );

    await this.securityRepository.updateCurrentActiveSessions(
      newTokenPayload.deviceId,
      new Date(newTokenPayload.iat).toISOString(),
      new Date(newTokenPayload.exp).toISOString(),
    );

    return token;
  }

  async logoutFromCurrentSession(refreshToken: string) {
    await this.jwtService.addTokenInBlackList(refreshToken);
    const tokenPayload = await this.jwtService.getTokenPayload(refreshToken);
    await this.securityRepository.deleteDeviceById(tokenPayload.deviceId);

    return;
  }

  async deleteAllActiveSessions(
    userId: string,
    deviceId: string,
  ): Promise<boolean> {
    return await this.securityRepository.deleteAllActiveSessions(
      userId,
      deviceId,
    );
  }

  async deleteDeviceById(deviceId: string): Promise<boolean> {
    return await this.securityRepository.deleteDeviceById(deviceId);
  }
}
