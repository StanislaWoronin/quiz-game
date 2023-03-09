import {NewUserDto} from "../applications/dto/new-user.dto";
import {CreatedUser} from "../api/view/created-user";

export interface IUsersRepository {
    createUser(newUser: NewUserDto, hash: string): Promise<CreatedUser | null>;
}

export const IUsersRepository = 'IUsersRepository'