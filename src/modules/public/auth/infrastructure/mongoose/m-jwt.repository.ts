import { Injectable } from '@nestjs/common';
import { IJwtRepository } from '../i-jwt.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  MongoTokenBlackList,
  TokenBlackListDocument,
} from './schema/token-black-list.schema';

@Injectable()
export class MJwtRepository implements IJwtRepository {
  constructor(
    @InjectModel(MongoTokenBlackList.name)
    private tokenBlackListModel: Model<TokenBlackListDocument>,
  ) {}

  async checkTokenInBlackList(refreshToken: string): Promise<boolean> {
    const result = await this.tokenBlackListModel.exists({
      token: refreshToken,
    });
    if (!result) {
      return false;
    }
    return true;
  }

  async addTokenInBlackList(refreshToken: string): Promise<boolean> {
    const result = await this.tokenBlackListModel.create({
      token: refreshToken,
    });

    if (!result) {
      return false;
    }
    return true;
  }
}
