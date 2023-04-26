import { Inject, Injectable } from '@nestjs/common';
import { IEmailConfirmationRepository } from '../i-email-confirmation.repository';
import { InjectModel } from '@nestjs/mongoose';
import { MongoUsers, UsersDocument } from './schema/user.schema';
import { Model } from 'mongoose';
import { SqlEmailConfirmation } from '../sql/entity/sql-email-confirmation.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class MEmailConfirmationRepository
  implements IEmailConfirmationRepository
{
  constructor(
    @InjectModel(MongoUsers.name)
    private userModel: Model<UsersDocument>,
  ) {}

  async getEmailConfirmationByCode(
    confirmationCode: string,
  ): Promise<SqlEmailConfirmation | null> {
    const emailConfirmation = await this.userModel
      .findOne({ 'emailConfirmation.confirmationCode': confirmationCode })
      .select({
        _id: 1,
        'emailConfirmation.confirmationCode': 1,
        'emailConfirmation.expirationDate': 1,
        'emailConfirmation.isConfirmed': 1,
      });
    console.log(emailConfirmation, 'getEmailConfirmationByCode');
    // @ts-ignore
    return new SqlEmailConfirmation(
      emailConfirmation._id,
      emailConfirmation.isConfirmed,
      emailConfirmation.confirmationCode,
      emailConfirmation.expirationDate,
    );
  }

  async checkConfirmation(userId: string): Promise<boolean | null> {
    const result = await this.userModel
      .findOne({ _id: new ObjectId(userId) })
      .select({
        'emailConfirmation.isConfirmed': 1,
      });
    console.log(result, 'checkConfirmation');
    if (!result) {
      return null;
    }
    // @ts-ignore
    return result;
  }

  async updateConfirmationInfo(confirmationCode: string): Promise<boolean> {
    const result = await this.userModel.updateOne(
      { 'emailConfirmation.confirmationCode': confirmationCode },
      { 'emailConfirmation.isConfirmed': true },
    );

    return result.matchedCount === 1;
  }

  async updateConfirmationCode(
    userId: string,
    confirmationCode: string,
    expirationDate: string,
  ): Promise<boolean> {
    const result = await this.userModel.updateOne(
      { _id: new ObjectId(userId) },
      {
        'emailConfirmation.confirmationCode': confirmationCode,
        'emailConfirmation.expirationDate': expirationDate,
      },
    );

    return result.matchedCount === 1;
  }
}
