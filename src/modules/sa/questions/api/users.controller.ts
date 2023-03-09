import {Body, Controller, Get, Inject, Post, Query, UseGuards} from "@nestjs/common";
import {AuthBasicGuard} from "../../../../guards/auth-basic.guard";
import {UsersService} from "../../users/applications/users.service";
import {IUsersQueryRepository} from "../../users/infrastructure/i-users-query.repository";
import {CreateUserDto} from "../../users/api/dto/create-user.dto";
import {CreatedUser} from "../../users/api/view/created-user";
import {ViewPage} from "../../../../shared/pagination/view-page";
import {ViewUser} from "../../users/api/view/view-user";
import {UsersQueryDto} from "../../users/api/dto/query/users-query.dto";

@UseGuards(AuthBasicGuard)
@Controller('sa/users')
export class UsersController {
    constructor(
        protected usersService: UsersService,
        @Inject(IUsersQueryRepository)
        protected usersQueryRepository: IUsersQueryRepository,
    ) {
    }

    @Post()
    async createUser(
        @Body() dto: CreateUserDto
    ): Promise<CreatedUser> {
        return await this.usersService.createUser(dto)
    }

    @Get()
    async getUsers(
        @Query() query: UsersQueryDto
    ): Promise<ViewPage<ViewUser>> {
        return await this.usersQueryRepository.getUsers(query)
    }
}