import { NewUserDto } from '../applications/dto/new-user.dto';
import { CreatedUser } from '../api/view/created-user';
import { UpdateUserBanStatusDto } from '../api/dto/update-user-ban-status.dto';
import { SqlEmailConfirmation } from './sql/entity/sql-email-confirmation.entity';

export interface IUsersRepository {
  createUser(
    newUser: NewUserDto,
    hash: string,
    emailConfirmation: SqlEmailConfirmation,
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
