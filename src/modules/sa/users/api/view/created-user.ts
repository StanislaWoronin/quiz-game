import { SqlUsers } from '../../infrastructure/sql/entity/users.entity';
import { ApiProperty } from '@nestjs/swagger';
import { MongoUsers } from '../../infrastructure/mongoose/schema/user.schema';
import type { WithId } from 'mongodb';

export class CreatedUser {
  @ApiProperty()
  readonly id: string;
  @ApiProperty()
  readonly login: string;
  @ApiProperty()
  readonly email: string;
  @ApiProperty()
  readonly createdAt: string;
  @ApiProperty()
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

  static userWithObjectId(createdUser: WithId<MongoUsers>): CreatedUser {
    return {
      id: createdUser._id.toString(),
      login: createdUser.login,
      email: createdUser.email,
      createdAt: createdUser.createdAt,
      banInfo: {
        isBanned: createdUser.banInfo.isBanned,
        banReason: createdUser.banInfo.banReason,
        banDate: createdUser.banInfo.banDate,
      },
    };
  }
}
