import { SqlUsers } from '../../infrastructure/sql/entity/users.entity';

export class CreatedUser {
  readonly id: string;
  readonly login: string;
  readonly email: string;
  readonly createdAt: string;
  readonly banInfo: {
    readonly isBanned: boolean;
    readonly banDate: string;
    readonly banReason: string;
  };

  constructor(createdUser: SqlUsers) {
    this.id = createdUser.id;
    this.login = createdUser.login;
    this.email = createdUser.email;
    this.createdAt = createdUser.createdAt;
    this.banInfo = {
      isBanned: false,
      banReason: null,
      banDate: null,
    };
  }
}
