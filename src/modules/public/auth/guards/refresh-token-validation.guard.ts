import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {JwtService} from "../applications/jwt.service";
import {IUsersQueryRepository} from "../../../sa/users/infrastructure/i-users-query.repository";

@Injectable()
export class RefreshTokenValidationGuard implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    @Inject(IUsersQueryRepository)
    protected queryUsersRepository: IUsersQueryRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    if (!req.cookies.refreshToken) {
      // console.log('Отсутствует токен в req.cookies.refreshToken')
      throw new UnauthorizedException();
    }

    const tokenInBlackList = await this.jwtService.checkTokenInBlackList(
      req.cookies.refreshToken,
    );

    if (tokenInBlackList) {
      // console.log('Токен в черном списке')
      throw new UnauthorizedException();
    }

    const tokenPayload = await this.jwtService.getTokenPayload(
      req.cookies.refreshToken,
    );

    if (!tokenPayload) {
      // console.log('Токен не рассекретился')
      throw new UnauthorizedException();
    }

    const user = await this.queryUsersRepository.checkUserExists(
      tokenPayload.userId,
    );

    if (!user) {
      // console.log('Пользовотель не нашелся')
      throw new UnauthorizedException();
    }

    req.userId = tokenPayload.userId;
    req.deviceId = tokenPayload.deviceId;
    return true;
  }
}
