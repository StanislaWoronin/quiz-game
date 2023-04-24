import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoUsers, UsersDocument } from './schema/user.schema';
import { Model } from 'mongoose';
import { UsersQueryDto } from '../../api/dto/query/users-query.dto';
import { ViewPage } from '../../../../../common/pagination/view-page';
import { ViewUser } from '../../api/view/view-user';
import { BanStatus } from '../../api/dto/query/ban-status';
import {IUsersQueryRepository} from "../i-users-query.repository";
import {SqlUsers} from "../sql/entity/users.entity";
import {ObjectId} from "mongodb";

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
      { $project: { _id: false, password: false, __v: false } },
    ]);
    const totalCount = await this.userModel.countDocuments({
      $and: filter,
    });

    return new ViewPage<ViewUser>({
      items: users ?? [],
      query: query,
      totalCount,
    });
  }

  async getUserByLoginOrEmail(loginOrEmail: string): Promise<SqlUsers | null> {
    const user = await this.userModel.findOne({
      $or: [
        {login: loginOrEmail},
        {email: loginOrEmail}
      ]}).select('_id login email createdAt')

    return user
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
