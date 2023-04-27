import {Injectable} from "@nestjs/common";
import {ISecurityRepository} from "../i-security.repository";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {MongoSecurity, SecurityDocument} from "./schema/security.schema";
import {SqlSecurity} from "../sql/entity/security";

@Injectable()
export class MSecurityRepository implements ISecurityRepository {
    constructor(
        @InjectModel(MongoSecurity.name)
        private securityModel: Model<SecurityDocument>
    ) {
    }

    async createUserDevice(newDevice: SqlSecurity): Promise<boolean> {
        const result = await this.securityModel.create(newDevice)
        console.log(result, 'createUserDevice')
        return true
    }

    async updateCurrentActiveSessions(
        deviceId: string,
        iat: string,
        exp: string,
    ): Promise<boolean> {
        const result = await this.securityModel.updateOne({deviceId},{
            $set: { iat, exp}
        })

        return result.matchedCount === 1
    }

    async deleteAllActiveSessions(
        userId: string,
        deviceId: string,
    ): Promise<boolean> {
        const result = await this.securityModel.deleteMany({
            $and: [
                {userId},
                { deviceId: { $ne: deviceId }},
            ]
        })

        return true
    }

    async deleteDeviceById(deviceId: string): Promise<boolean> {
        const result = await this.securityModel.deleteOne({deviceId})

        return result.deletedCount === 1
    }
}