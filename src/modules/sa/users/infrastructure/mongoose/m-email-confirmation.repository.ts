import { Injectable } from '@nestjs/common';
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
        emailConfirmation: 1,
      });

    if (!emailConfirmation) return null;
    return {
      userId: emailConfirmation._id.toString(),
      confirmationCode: emailConfirmation.emailConfirmation.confirmationCode,
      expirationDate: emailConfirmation.emailConfirmation.expirationDate,
      isConfirmed: emailConfirmation.emailConfirmation.isConfirmed,
    } as SqlEmailConfirmation;
  }

  async checkConfirmation(userId: string): Promise<boolean | null> {
    const result = await this.userModel
      .findOne({ _id: new ObjectId(userId) })
      .select({
        'emailConfirmation.isConfirmed': 1,
        _id: 0,
      });

    if (!result) return null;
    return result.emailConfirmation.isConfirmed;
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
        $set: {
          'emailConfirmation.confirmationCode': confirmationCode,
          'emailConfirmation.expirationDate': expirationDate,
        },
      },
    );

    return result.matchedCount === 1;
  }
}
