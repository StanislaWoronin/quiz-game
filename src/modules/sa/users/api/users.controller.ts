import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthBasicGuard } from '../../../public/auth/guards/auth-basic.guard';
import { UsersService } from '../applications/users.service';
import { IUsersQueryRepository } from '../infrastructure/i-users-query.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { CreatedUser } from './view/created-user';
import { ViewPage } from '../../../../common/pagination/view-page';
import { ViewUser } from './view/view-user';
import { UsersQueryDto } from './dto/query/users-query.dto';
import { UpdateUserBanStatusDto } from './dto/update-user-ban-status.dto';
import { CreateUserBySaUseCase } from '../use-cases/create-user-by-sa.use-case';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import {
  ApiCreateUser,
  ApiDeleteUser,
  ApiGetUsers,
  ApiUpdateUserBanStatus,
} from '../../../documentations/sa.documentation';

@ApiTags('SA')
@ApiBasicAuth()
@UseGuards(AuthBasicGuard)
@Controller('sa/users')
export class UsersController {
  constructor(
    protected createUserUseCase: CreateUserBySaUseCase,
    protected usersService: UsersService,
    @Inject(IUsersQueryRepository)
    protected usersQueryRepository: IUsersQueryRepository,
  ) {}

  @Post()
  @ApiCreateUser()
  async createUser(@Body() dto: CreateUserDto): Promise<CreatedUser> {
    return await this.createUserUseCase.execute(dto);
  }

  @Get()
  @ApiGetUsers()
  async getUsers(@Query() query: UsersQueryDto): Promise<ViewPage<ViewUser>> {
    return await this.usersQueryRepository.getUsers(query);
  }

  @Put(':id/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiUpdateUserBanStatus()
  async updateUserBanStatus(
    @Param('id') userId: string,
    @Body() dto: UpdateUserBanStatusDto,
  ) {
    return await this.usersService.updateUserBanInfo(userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteUser()
  async deleteUser(@Param('id') userId: string) {
    const isDeleted = await this.usersService.deleteUser(userId);

    if (!isDeleted) {
      throw new NotFoundException();
    }
    return;
  }
}
