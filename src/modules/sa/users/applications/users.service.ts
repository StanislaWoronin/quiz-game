import { Inject, Injectable } from '@nestjs/common';
import { IUsersRepository } from '../infrastructure/i-users.repository';
import { CreatedUser } from '../api/view/created-user';
import { CreateUserDto } from '../api/dto/create-user.dto';
import { NewUserDto } from './dto/new-user.dto';
import * as bcrypt from 'bcrypt';
import { settings } from '../../../../settings';
import { UpdateUserBanStatusDto } from '../api/dto/update-user-ban-status.dto';
import { SqlEmailConfirmation } from '../../../public/auth/infrastructure/sql/entity/email-confirmation.entity';

@Injectable()
export class UsersService {
  constructor(
    @Inject(IUsersRepository)
    protected usersRepository: IUsersRepository,
  ) {}

  async createUser(
    dto: CreateUserDto,
    emailConfirmation: SqlEmailConfirmation,
  ): Promise<CreatedUser> {
    const newUser = new NewUserDto(dto);

    try {
      const salt = await bcrypt.genSalt(Number(settings.SALT_GENERATE_ROUND));
      const hash = await bcrypt.hash(dto.password, salt);

      return await this.usersRepository.createUser(
        newUser,
        hash,
        emailConfirmation,
      );
    } catch (e) {
      // Error try again
    }
  }

  async updateUserBanInfo(
    userId: string,
    dto: UpdateUserBanStatusDto,
  ): Promise<boolean> {
    if (!dto.isBanned) {
      await this.usersRepository.removeBanStatus(userId);
    } else {
      await this.usersRepository.updateBanStatus(userId, dto);
    }

    return true;
  }

  async deleteUser(userId: string): Promise<boolean> {
    return await this.usersRepository.deleteUser(userId);
  }
}
