import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import {IUsersQueryRepository} from "../../../sa/users/infrastructure/i-users-query.repository";
import {IUserBanInfoRepository} from "../../../sa/users/infrastructure/i-user-ban-info.repository";
import {SqlCredentials} from "../../../sa/users/infrastructure/sql/entity/credentials.entity";

@Injectable()
export class CheckCredentialGuard implements CanActivate {
  constructor(
    @Inject(IUserBanInfoRepository) protected banInfoRepository: IUserBanInfoRepository,
    @Inject(IUsersQueryRepository)
    protected queryUsersRepository: IUsersQueryRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const userCredential: SqlCredentials | null =
      await this.queryUsersRepository.getCredentialByLoginOrEmail(
        req.body.loginOrEmail,
      );

    if (!userCredential) {
      throw new UnauthorizedException();
    }

    const isBanned = await this.banInfoRepository.checkBanStatus(userCredential.userId);

    if (isBanned) {
      throw new UnauthorizedException();
    }

    const passwordEqual = await bcrypt.compare(
      req.body.password,
      userCredential.credentials,
    );

    if (!passwordEqual) {
      throw new UnauthorizedException();
    }

    req.userId = userCredential.userId;
    return true;
  }
}
