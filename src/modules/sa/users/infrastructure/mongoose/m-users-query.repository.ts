import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MongoUsers, UsersDocument } from './schema/userSchema';
import { Model } from 'mongoose';
import { UsersQueryDto } from '../../api/dto/query/users-query.dto';
import { ViewPage } from '../../../../../common/pagination/view-page';
import { ViewUser } from '../../api/view/view-user';
import { BanStatus } from '../../api/dto/query/ban-status';

@Injectable()
export class MUsersQueryRepository {
  constructor(
    @InjectModel(MongoUsers.name) private usersRepository: Model<UsersDocument>,
  ) {}

  async getUsers(query: UsersQueryDto): Promise<ViewPage<ViewUser>> {
    const filter = this.getFilter(query);

    const users = await this.usersRepository.aggregate([
      { $match: { $and: filter } },
      { $sort: { [query.sortBy]: query.sortDirection === 'asc' ? 1 : -1 } },
      { $skip: query.skip },
      { $limit: query.pageSize },
      { $project: { _id: false, __v: false } },
    ]);
    const totalCount = await this.usersRepository.countDocuments({
      $and: filter,
    });

    return new ViewPage<ViewUser>({
      items: users ?? [],
      query: query,
      totalCount,
    });
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
