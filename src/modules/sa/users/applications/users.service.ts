import { Inject, Injectable } from '@nestjs/common';
import { IUsersRepository } from '../infrastructure/i-users.repository';
import { CreatedUser } from '../api/view/created-user';
import { CreateUserDto } from '../api/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { settings } from '../../../../settings';
import { UpdateUserBanStatusDto } from '../api/dto/update-user-ban-status.dto';
import { EmailConfirmationDto } from './dto/email-confirmation.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(IUsersRepository)
    protected usersRepository: IUsersRepository,
  ) {}

  async createUser(
    dto: CreateUserDto,
    emailConfirmationDto: EmailConfirmationDto,
  ): Promise<CreatedUser> {
    try {
      const salt = await bcrypt.genSalt(Number(settings.SALT_GENERATE_ROUND));
      const hash = await bcrypt.hash(dto.password, salt);
      const res = await this.usersRepository.createUser(
        dto,
        hash,
        emailConfirmationDto,
      );
      console.log(res, 'from service');
      return res;
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

  async updateUserPassword(
    userId: string,
    newPassword: string,
  ): Promise<boolean> {
    try {
      const salt = await bcrypt.genSalt(Number(settings.SALT_GENERATE_ROUND));
      const hash = await bcrypt.hash(newPassword, salt);

      return await this.usersRepository.updateUserPassword(userId, hash);
    } catch (e) {
      // Error try again
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    return await this.usersRepository.deleteUser(userId);
  }
}
