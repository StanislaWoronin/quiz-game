import {Inject, Injectable} from "@nestjs/common";
import {IUsersRepository} from "../infrastructure/i-users.repository";
import {CreatedUser} from "../api/view/created-user";
import {CreateUserDto} from "../api/dto/create-user.dto";
import {NewUserDto} from "./dto/new-user.dto";
import * as bcrypt from 'bcrypt';
import {settings} from "../../../../settings";

@Injectable()
export class UsersService {
    constructor(
        @Inject(IUsersRepository)
        protected usersRepository: IUsersRepository,
    ) {
    }

    async createUser(dto: CreateUserDto): Promise<CreatedUser> {
        const newUser = new NewUserDto(dto);

        const saltOrRounds = settings.SALT_GENERATE_ROUND;
        const password = dto.password;
        const hash = await bcrypt.hash(password, saltOrRounds);

        return await this.usersRepository.createUser(newUser, hash);
    }
}