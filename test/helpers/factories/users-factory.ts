import { Users } from '../request/users';
import { CreatedUser } from '../../../src/modules/sa/users/api/view/created-user';
import { CreateUserDto } from '../../../src/modules/sa/users/api/dto/create-user.dto';
import { faker } from '@faker-js/faker';
import { preparedSuperUser } from '../prepeared-data/prepared-super-user';
import { ViewUser } from '../../../src/modules/sa/users/api/view/view-user';
import { UpdateUserBanStatusDto } from '../../../src/modules/sa/users/api/dto/update-user-ban-status.dto';
import { BanStatus } from '../../../src/modules/sa/users/api/dto/query/ban-status';

export class UsersFactory {
  constructor(private users: Users) {}

  async createUsers(usersCount: number): Promise<CreatedUser[]> {
    const result = [];
    for (let i = 0; i < usersCount; i++) {
      const inputData: CreateUserDto = {
        login: `${i}${faker.random.alpha(6)}`,
        password: faker.random.alpha(20),
        email: `${i}${faker.internet.email()}`,
      };
      const response = await this.users.createUser(
        preparedSuperUser.valid,
        inputData,
      );

      result.push(response.body);
    }

    return result;
  }

  async crateAndBanUsers(usersCount: number): Promise<ViewUser[]> {
    const createdUsers: CreatedUser[] = await this.createUsers(usersCount);

    const result = [];
    for (let i = 0; i < usersCount; i++) {
      const updateBanStatusDto: UpdateUserBanStatusDto = {
        isBanned: true,
        banReason: faker.random.alpha(20),
      };

      const response = await this.users.setBanStatus(
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
}
