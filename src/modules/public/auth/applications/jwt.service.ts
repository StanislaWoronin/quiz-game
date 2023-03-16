import { Inject, Injectable } from '@nestjs/common';
import { settings } from '../../../../settings';
import { IJwtRepository } from '../infrastructure/i-jwt.repository';
import { Tokens } from '../../../../common/dto/tokens';
import { TokenPayload } from '../../../../common/dto/token-payload';
import { JwtService as NestJwtService } from '@nestjs/jwt';

@Injectable()
export class JwtService {
  constructor(
    @Inject(IJwtRepository) protected jwtRepository: IJwtRepository,
    private readonly jwtService: NestJwtService,
  ) {}

  async getTokenPayload(token: string): Promise<TokenPayload | null> {
    try {
      const result: any = this.jwtService.decode(token) as TokenPayload;

      return new TokenPayload(result);
    } catch (error) {
      return null;
    }
  }

  async checkTokenInBlackList(refreshToken: string): Promise<boolean> {
    return await this.jwtRepository.checkTokenInBlackList(refreshToken);
  }

  async addTokenInBlackList(refreshToken: string): Promise<boolean> {
    return await this.jwtRepository.addTokenInBlackList(refreshToken);
  }

  async createJWT(
    userId: string,
    deviceId: string,
    tokenType: string,
  ): Promise<string> {
    try {
      const tokenSecurity = { secret: null, expiresIn: null };
      if (tokenType === 'at') {
        tokenSecurity.secret = settings.ACCESS_TOKEN_SECRET;
        tokenSecurity.expiresIn = settings.timeLife.ACCESS_TOKEN;
      } else {
        tokenSecurity.secret = settings.REFRESH_TOKEN_SECRET;
        tokenSecurity.expiresIn = settings.timeLife.REFRESH_TOKEN;
      }

      return this.jwtService.sign({ userId, deviceId }, tokenSecurity);
    } catch (e) {
      throw Error('Something went wrong');
    }
  }

  async createTokens(userId: string, deviceId: string): Promise<Tokens> {
    const accessToken = await this.createJWT(userId, deviceId, 'at');
    const refreshToken = await this.createJWT(userId, deviceId, 'rt');

    return { accessToken, refreshToken };
  }
}
