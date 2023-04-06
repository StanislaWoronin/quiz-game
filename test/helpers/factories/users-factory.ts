import { Users } from '../request/users';
import { CreatedUser } from '../../../src/modules/sa/users/api/view/created-user';
import { CreateUserDto } from '../../../src/modules/sa/users/api/dto/create-user.dto';
import { faker } from '@faker-js/faker';
import { preparedSuperUser } from '../prepeared-data/prepared-super-user';
import { ViewUser } from '../../../src/modules/sa/users/api/view/view-user';
import { UpdateUserBanStatusDto } from '../../../src/modules/sa/users/api/dto/update-user-ban-status.dto';
import { BanStatus } from '../../../src/modules/sa/users/api/dto/query/ban-status';
import { Auth } from '../request/auth';
import {UserWithTokensType} from "../type/auth/user-with-token-type";

export class UsersFactory {
  constructor(private users: Users, private auth: Auth) {}

  async createUsers(usersCount: number, startWith = 0): Promise<CreatedUser[]> {
    const result = [];
    for (let i = 0; i < usersCount; i++) {
      const inputData: CreateUserDto = {
        login: `login${i + startWith}`,
        password: `password${i + startWith}`,
        email: `${i + startWith}${faker.internet.email()}`,
      };
      const response = await this.users.createUser(
        preparedSuperUser.valid,
        inputData,
      );

      result.push(response.body);
    }

    return result;
  }

  async crateAndBanUsers(
    usersCount: number,
    startFrom?: number,
  ): Promise<ViewUser[]> {
    const createdUsers: CreatedUser[] = await this.createUsers(
      usersCount,
      startFrom,
    );

    const result = [];
    for (let i = 0; i < usersCount; i++) {
      const updateBanStatusDto: UpdateUserBanStatusDto = {
        isBanned: true,
        banReason: faker.random.alpha(20),
      };

      await this.users.setBanStatus(
        preparedSuperUser.valid,
        updateBanStatusDto,
        createdUsers[i].id,
      );

      const users = await this.users.getUsers(preparedSuperUser.valid, {
        banStatus: BanStatus.Banned,
      });

      result.push({
        id: createdUsers[i].id,
        login: createdUsers[i].login,
        email: createdUsers[i].email,
        createdAt: createdUsers[i].createdAt,
        banInfo: {
          isBanned: updateBanStatusDto.isBanned,
          banReason: updateBanStatusDto.banReason,
          banDate: users.body.items[0].banInfo.banDate,
        },
      });
    }

    return result;
  }

  async createAndLoginUsers(
    userCount: number,
    startWith = 0,
  ): Promise<UserWithTokensType[]> {
    const users = await this.createUsers(userCount, startWith);

    const result = [];
    for (let i = 0; i < userCount; i++) {
      const userLoginData = {
        loginOrEmail: `login${i + startWith}`,
        password: `password${i + startWith}`,
      };

      const response = await this.auth.loginUser(userLoginData);

      result.push({
        user: users[i],
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
    }

    return result;
  }
}
