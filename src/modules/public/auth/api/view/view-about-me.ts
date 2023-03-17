import {SqlUsers} from "../../../../sa/users/infrastructure/sql/entity/users.entity";

export class ViewAboutMe {
    readonly userId: string
    readonly login: string
    readonly email: string

    constructor(user: SqlUsers) {
        this.userId = user.id
        this.login = user.login
        this.email = user.email
    }
}