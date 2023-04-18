import { CreatedUser } from '../api/view/created-user';
import { UpdateUserBanStatusDto } from '../api/dto/update-user-ban-status.dto';
import { SqlEmailConfirmation } from './sql/entity/sql-email-confirmation.entity';
import { CreateUserDto } from '../api/dto/create-user.dto';
import { EmailConfirmationDto } from '../applications/dto/email-confirmation.dto';

export interface IUsersRepository {
  createUser(
    dto: CreateUserDto,
    hash: string,
    emailConfirmationDto: EmailConfirmationDto,
  ): Promise<CreatedUser | null>;
  updateBanStatus(
    userId: string,
    dto: UpdateUserBanStatusDto,
  ): Promise<boolean>;
  updateUserPassword(userId: string, passwordHash: string): Promise<boolean>;
  removeBanStatus(userId: string): Promise<boolean>;
  deleteUser(userId: string): Promise<boolean>;
}

export const IUsersRepository = 'IUsersRepository';
