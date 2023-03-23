import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '../applications/jwt.service';
import { IUsersQueryRepository } from '../../../sa/users/infrastructure/i-users-query.repository';

@Injectable()
export class AuthBearerGuard implements CanActivate {
  constructor(
    protected jwtService: JwtService,
    @Inject(IUsersQueryRepository)
    protected queryUsersRepository: IUsersQueryRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    if (!req.headers.authorization) {
      console.log('1')
      throw new UnauthorizedException();
    }

    const accessToken = req.headers.authorization.split(' ')[1];
    const tokenPayload = await this.jwtService.getTokenPayload(accessToken);

    if (!tokenPayload) {
      console.log('2')
      throw new UnauthorizedException();
    }

    const user = await this.queryUsersRepository.checkUserExists(
      tokenPayload.userId,
    );

    if (!user) {
      console.log('3')
      throw new UnauthorizedException();
    }

    req.userId = tokenPayload.userId;
    req.token = tokenPayload;
    return true;
  }
}
