import { NewUserDto } from "../../applications/dto/new-user.dto";

export class CreatedUser {
    readonly id: string
    readonly login: string
    readonly email: string
    readonly createdAt: string
    readonly banInfo: {
        readonly isBanned: boolean
        readonly banDate: string
        readonly banReason: string
    }

    constructor(id: string, createdUser: NewUserDto) {
        this.id = id
        this.login = createdUser.login
        this.email = createdUser.email
        this.createdAt = createdUser.createdAt
        this.banInfo = {
            isBanned: false,
            banReason: null,
            banDate: null,
        }
    }
}