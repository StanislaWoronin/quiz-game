import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoUsers, UsersDocument } from './schema/user.schema';
import { Model } from 'mongoose';
import { UsersQueryDto } from '../../api/dto/query/users-query.dto';
import { ViewPage } from '../../../../../common/pagination/view-page';
import { ViewUser } from '../../api/view/view-user';
import { BanStatus } from '../../api/dto/query/ban-status';
import { IUsersQueryRepository } from '../i-users-query.repository';
import { SqlUsers } from '../sql/entity/users.entity';
import { ObjectId } from 'mongodb';
import { SqlCredentials } from '../sql/entity/credentials.entity';
import { CreatedUser } from '../../api/view/created-user';

@Injectable()
export class MUsersQueryRepository implements IUsersQueryRepository {
  constructor(
    @InjectModel(MongoUsers.name)
    private userModel: Model<UsersDocument>,
  ) {}

  async getUsers(query: UsersQueryDto): Promise<ViewPage<ViewUser>> {
    const filter = this.getFilter(query);

    const users = await this.userModel.aggregate([
      { $match: { $and: filter } },
      { $sort: { [query.sortBy]: query.sortDirection === 'asc' ? 1 : -1 } },
      { $skip: query.skip },
      { $limit: query.pageSize },
      { $project: { password: false, __v: false, emailConfirmation: false } },
    ]);
    const items = users.map((u) => CreatedUser.userWithObjectId(u));
    const totalCount = await this.userModel.countDocuments({
      $and: filter,
    });

    return new ViewPage<ViewUser>({
      items,
      query: query,
      totalCount,
    });
  }

  async checkUserExists(userId: string): Promise<boolean> {
    const result = await this.userModel.exists({ _id: new ObjectId(userId) });

    if (!result) return false;
    return true;
  }

  async isLoginOrEmailExist(loginOrEmail: string): Promise<boolean> {
    const result = await this.userModel.exists({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    }); // exist return _id if exists and null if not exists

    if (!result) {
      return false;
    }
    return true;
  }

  async getCredentialByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<SqlCredentials | null> {
    const credential = await this.userModel
      .findOne({
        $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
      })
      .select({
        password: 1,
      });

    if (!credential) return null;
    return new SqlCredentials(credential._id.toString(), credential.password);
  }

  async getUserByLoginOrEmail(loginOrEmail: string): Promise<string | null> {
    const user = await this.userModel.exists({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });

    if (!user) return null;
    return user._id.toString();
  }

  async getUserById(userId: string): Promise<SqlUsers | null> {
    const user = await this.userModel
      .findOne({ _id: new ObjectId(userId) })
      .select({
        _id: 1,
        login: 1,
        email: 1,
        createdAt: 1,
      });

    return {
      id: user._id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    } as SqlUsers;
  }

  private getFilter(query: UsersQueryDto) {
    const { banStatus, searchLoginTerm, searchEmailTerm } = query;

    const filter = [];
    if (banStatus !== BanStatus.All) {
      filter.push(this.getBanStatusFilter(banStatus));
    }

    filter.push({
      $or: [
        { login: { $regex: searchLoginTerm ?? '', $options: 'i' } },
        { email: { $regex: searchEmailTerm ?? '', $options: 'i' } },
      ],
    });

    return filter;
  }

  private getBanStatusFilter(banStatus: BanStatus) {
    if (banStatus === BanStatus.Banned) {
      return { 'banInfo.isBanned': true };
    }
    return { 'banInfo.isBanned': false };
  }
}
