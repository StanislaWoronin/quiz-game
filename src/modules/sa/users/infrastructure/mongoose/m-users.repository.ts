import { Injectable } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { MongoUsers, UsersDocument } from "./schema/userSchema";
import { ClientSession, connection, Connection, Model } from "mongoose";
import { NewUserDto } from "../../applications/dto/new-user.dto";
import { CreatedUser } from "../../api/view/created-user";
import { randomUUID } from "crypto";
import { UpdateUserBanStatusDto } from "../../api/dto/update-user-ban-status.dto";
import { CredentialsDocument, MongoCredentials } from "./schema/credential.schema";

@Injectable()
export class MUsersRepository {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(MongoUsers.name) private usersRepository: Model<UsersDocument>,
    @InjectModel(MongoCredentials.name) private credentialsRepository: Model<CredentialsDocument>
  ) {
  }

  async createUser(newUser: NewUserDto, hash: string): Promise<CreatedUser | null> {
    const session: ClientSession = await this.connection.startSession();

    let createdUser
    try {
      await session.withTransaction(async () => {
        const user = { id: randomUUID(), ...newUser }
        const r = await this.usersRepository.create([{ ...user }], { session });
        const res =  await this.credentialsRepository.create([{userId: user.id, credential: hash}], { session })
        console.log(r, 'mongo repo')
        createdUser = res[0]
      })
    } finally {
      await session.endSession();
    }

    return new CreatedUser(createdUser.userId, newUser)
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

  async deleteUser(userId: string): Promise<boolean> {
    const session: ClientSession = await this.connection.startSession();

    try {
      await session.withTransaction(async () => {
        await this.usersRepository.deleteOne([{ id: userId }], { session })
        await this.credentialsRepository.deleteOne({ userId }, { session })
      })

      return true
    } finally {
      await session.endSession();
    }
  }
}