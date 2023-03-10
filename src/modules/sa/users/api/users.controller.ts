import {
    Body,
    Controller, Delete,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Param,
    Post,
    Put,
    Query,
    UseGuards
} from "@nestjs/common";
import {AuthBasicGuard} from "../../../../guards/auth-basic.guard";
import {UsersService} from "../applications/users.service";
import {IUsersQueryRepository} from "../infrastructure/i-users-query.repository";
import {CreateUserDto} from "./dto/create-user.dto";
import {CreatedUser} from "./view/created-user";
import {ViewPage} from "../../../../common/pagination/view-page";
import {ViewUser} from "./view/view-user";
import {UsersQueryDto} from "./dto/query/users-query.dto";
import { UpdateUserBanStatusDto } from "./dto/update-user-ban-status.dto";

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

    @HttpCode(HttpStatus.NO_CONTENT)
    @Put(':id/ban')
    async updateUserBanStatus(
      @Param('id') userId: string,
      @Body() dto: UpdateUserBanStatusDto
    ) {
        return await this.usersService.updateUserBanInfo(userId, dto)
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    async deleteUser(
      @Param('id') userId: string,
    ) {
        return await this.usersService.deleteUser(userId)
    }
}