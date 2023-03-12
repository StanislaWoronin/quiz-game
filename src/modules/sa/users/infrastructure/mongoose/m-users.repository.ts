import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { MongoUsers, UsersDocument } from "./schema/userSchema";
import { ClientSession, Model } from "mongoose";
import { NewUserDto } from "../../applications/dto/new-user.dto";
import { CreatedUser } from "../../api/view/created-user";
import { randomUUID } from "crypto";
import { UpdateUserBanStatusDto } from "../../api/dto/update-user-ban-status.dto";
import { CredentialsDocument, MongoCredentials } from "./schema/credential.schema";
import mongoose from "mongoose";
import { MongoUserBanInfo, UserBanInfoDocument } from "./schema/user-ban-info.schema";

@Injectable()
export class MUsersRepository {
  constructor(
    @InjectModel(MongoUserBanInfo.name) private banInfoRepository: Model<UserBanInfoDocument>,
    @InjectModel(MongoUsers.name) private usersRepository: Model<UsersDocument>,
    @InjectModel(MongoCredentials.name) private credentialsRepository: Model<CredentialsDocument>
  ) {
  }

  async createUser(newUser: NewUserDto, hash: string): Promise<CreatedUser | null> {
    try {
      const user = { id: randomUUID(), ...newUser }
      await this.usersRepository.create({ ...user });
      await this.credentialsRepository.create({userId: user.id, credential: hash})

      return new CreatedUser(user.id, newUser)
    } catch (e) {
      console.log(e);
    }

    // const session: ClientSession = await mongoose.startSession();
    //
    // session.startTransaction();
    // try {
    //   const user = { id: randomUUID(), ...newUser }
    //   await this.usersRepository.create({ ...user });
    //   await this.credentialsRepository.create({userId: user.id, credential: hash})
    //
    //   await session.commitTransaction();
    //   return new CreatedUser(user.id, newUser)
    // } catch (e) {
    //   await session.abortTransaction();
    //   console.log(e);
    //   throw e
    // } finally {
    //   session.endSession();
    // }
  }

  async updateBanStatus(userId: string, dto: UpdateUserBanStatusDto): Promise<boolean> {
    let banDate = new Date().toISOString()
    if (!dto.isBanned) {
      banDate = null
    }
    const result = await this.usersRepository.updateOne(
      { id: userId },
      {
        $set: {
          "banInfo.isBanned": dto.isBanned,
          "banInfo.banReason": dto.banReason,
          "banInfo.banDate": banDate
        }
      },
      { upsert: true }
    );

    return result.matchedCount === 1;
  }

  async removeBanStatus(userId: string): Promise<boolean> {
    const dto = {
      isBanned: false,
      banReason: null,
    }
    return this.updateBanStatus(userId, dto)
  }
}