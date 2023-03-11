import {Injectable} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {NewUserDto} from "../../applications/dto/new-user.dto";
import {CreatedUser} from "../../api/view/created-user";
import {Users} from "./entity/users.entity";
import {Credentials} from "./entity/credentials.entity";
import {toCreatedUser} from "../../../../../common/data-mapper/to-created-user";
import { CreatedUserDb } from "./pojo/created-user.db";
import { UserBanInfo } from "./entity/ban-info.entity";
import { UpdateUserBanStatusDto } from "../../api/dto/update-user-ban-status.dto";

@Injectable()
export class UsersRepository {
    constructor(@InjectDataSource() private dataSource: DataSource) {}

    async createUser(newUser: NewUserDto, hash: string): Promise<CreatedUser | null> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        const manager = queryRunner.manager;
        try {
            const createdUser: CreatedUserDb = await manager
                .getRepository(Users)
                .save(newUser)

            await manager.getRepository(Credentials).save({
                userId: createdUser.id,
                credentials: hash
            })

            await queryRunner.commitTransaction();
            return toCreatedUser(createdUser)
        } catch (e) {
            await queryRunner.rollbackTransaction()
            console.log(e)
            return null
        } finally {
            await queryRunner.release();
        }
    }

    async updateBanStatus(id: string, dto: UpdateUserBanStatusDto): Promise<boolean> {
        const a = await this.dataSource.getRepository(UserBanInfo).upsert({
            userId: id,
            isBanned: dto.isBanned,
            banReason: dto.banReason,
            banDate: new Date().toISOString()
        }, ['userId'])

        return true
    }

    async removeBanStatus(userId: string): Promise<boolean> {
        await this.dataSource.getRepository(UserBanInfo).delete({userId})

        return true
    }

    async deleteUser(userId: string): Promise<boolean> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        const manager = queryRunner.manager;
        try {
            const result = await this.dataSource
              .query(this
                .getQuery('users', 'id'), [userId]);

            if (result.affected === 0) {
                return false
            }

            await this.dataSource
              .query(this
                .getQuery('credentials', 'userId'), [userId])

            await this.dataSource
              .query(this
                .getQuery('user_ban_info', 'userId'), [userId])

            return true
        } catch (e) {
            console.log(e);
            await queryRunner.rollbackTransaction();
            return false
        } finally {
            await queryRunner.release();
        }
    }

    private getQuery(tableName: string, fieldName: string): string {
        return `DELETE 
                  FROM ${tableName} CASCADE
                 WHERE "${fieldName}" = $1`
    }
}