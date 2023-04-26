import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { MongoUsers, UsersDocument } from './schema/user.schema';
import { ClientSession, Connection, Model, Schema, Types } from 'mongoose';
import { CreatedUser } from '../../api/view/created-user';
import { UpdateUserBanStatusDto } from '../../api/dto/update-user-ban-status.dto';
import { CreateUserDto } from '../../api/dto/create-user.dto';
import { IUsersRepository } from '../i-users.repository';
import { EmailConfirmationDto } from '../../applications/dto/email-confirmation.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class MUsersRepository implements IUsersRepository {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(MongoUsers.name)
    private userModel: Model<UsersDocument>,
  ) {}

  async createUser(
    userDto: CreateUserDto,
    hash: string,
    emailConfirmationDto: EmailConfirmationDto,
  ): Promise<CreatedUser | null> {
    const session: ClientSession = await this.connection.startSession();

    try {
      await session.withTransaction(async () => {
        const user = new MongoUsers(userDto, hash, emailConfirmationDto);
        const createdUser = await this.userModel.create([user], { session });
        console.log(createdUser, 'mongo repo');
        // @ts-ignore
        return CreatedUser.createdUserWithObjectId(createdUser);
      });
    } finally {
      await session.endSession();
      return null;
    }
  }

  async updateBanStatus(
    userId: string,
    dto: UpdateUserBanStatusDto,
  ): Promise<boolean> {
    let banDate = new Date().toISOString();
    if (!dto.isBanned) {
      banDate = null;
    }
    const result = await this.userModel.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          'banInfo.isBanned': dto.isBanned,
          'banInfo.banReason': dto.banReason,
          'banInfo.banDate': banDate,
        },
      },
      //{ upsert: true },
    );

    return result.matchedCount === 1;
  }

  async updateUserPassword(
    userId: string,
    passwordHash: string,
  ): Promise<boolean> {
    const result = await this.userModel.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password: passwordHash } },
    );

    return result.matchedCount === 1;
  }

  async removeBanStatus(userId: string): Promise<boolean> {
    const dto = {
      isBanned: false,
      banReason: null,
    };
    return this.updateBanStatus(userId, dto);
  }

  async deleteUser(userId: string): Promise<boolean> {
    const session: ClientSession = await this.connection.startSession();

    try {
      await session.withTransaction(async () => {
        await this.userModel.deleteOne([{ _id: new ObjectId(userId) }], {
          session,
        });
      });

      return true;
    } finally {
      await session.endSession();
    }
  }
}
