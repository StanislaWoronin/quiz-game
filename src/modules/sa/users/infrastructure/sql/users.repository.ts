import {Injectable} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {NewUserDto} from "../../applications/dto/new-user.dto";
import {CreatedUser} from "../../api/view/created-user";
import {CreatedUserDb} from "./pojo/created-user-db";
import {Users} from "./entity/users.entity";
import {Credentials} from "./entity/credentials.entity";
import {toCreatedUser} from "../../../../../shared/data-mapper/to-created-user";

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
            return null
        } finally {
            await queryRunner.release();
        }
    }
}