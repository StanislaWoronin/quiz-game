import { Injectable } from '@nestjs/common';
import { IUserBanInfoRepository } from '../i-user-ban-info.repository';
import { InjectModel } from '@nestjs/mongoose';
import { MongoUsers, UsersDocument } from './schema/user.schema';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';

@Injectable()
export class MBanInfoRepository implements IUserBanInfoRepository {
  constructor(
    @InjectModel(MongoUsers.name)
    private userModel: Model<UsersDocument>,
  ) {}

  async checkBanStatus(userId: string): Promise<boolean> {
    const result = await this.userModel
      .findOne({
        _id: new ObjectId(userId),
      })
      .select({
        'banInfo.isBanned': 1,
        _id: 0,
      });

    return result.banInfo.isBanned;
  }
}
