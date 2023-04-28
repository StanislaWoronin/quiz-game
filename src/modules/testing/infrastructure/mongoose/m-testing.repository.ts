import { Injectable } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ITestingRepository } from '../i-testing.repository';
import {
  MongoUsers,
  UsersDocument,
} from '../../../sa/users/infrastructure/mongoose/schema/user.schema';

@Injectable()
export class MTestingRepository implements ITestingRepository {
  constructor(
    @InjectConnection() private connection: Connection,
    @InjectModel(MongoUsers.name)
    private readonly userModel: Model<UsersDocument>,
  ) {}

  async deleteAll(): Promise<boolean> {
    try {
      await this.connection.db.dropDatabase();

      return true;
    } catch (e) {
      console.log(e)
      return false;
    }
  }

  async getAllRowCount(): Promise<number> {
    const collections = await this.connection.db.collections();

    let totalCount = 0;
    for (const i of collections) {
      const name = i.namespace.split('.')[1];
      const count = await this.connection.db.collection(name).countDocuments();
      totalCount += count;
    }
    console.log(totalCount, 'm--testing')
    return totalCount;
  }

  async getUserPassword(userId: string): Promise<string> {
    const result = await this.userModel.findById(userId).select('password');
    console.log(result, 'getUserPassword');
    return result.password;
  }

  async getConfirmationCode(userId: string): Promise<string> {
    const result = await this.userModel
      .findById(userId)
      .select('emailConfirmation.confirmationCode');
    console.log(result, 'getConfirmationCode');
    return '';
  }

  async checkUserConfirmed(userId: string) {
    const result = await this.userModel
      .findById(userId)
      .select('emailConfirmation.isConfirmed');
    console.log(result, 'checkUserConfirmed');
    return result;
  }

  async makeExpired(userId: string, expirationDate: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndUpdate(userId, {
      expirationDate,
    });
    console.log(result, 'makeExpired');
    return true;
  }
}
