import {NewUserDto} from "../applications/dto/new-user.dto";
import {CreatedUser} from "../api/view/created-user";
import {UpdateUserBanStatusDto} from "../api/dto/update-user-ban-status.dto";

export interface IUsersRepository {
    createUser(newUser: NewUserDto, hash: string): Promise<CreatedUser | null>;
    updateBanStatus(userId: string, dto: UpdateUserBanStatusDto): Promise<boolean>;
    removeBanStatus(userId: string): Promise<boolean>;
    deleteUser(userId: string): Promise<boolean>;
}

export const IUsersRepository = 'IUsersRepository'