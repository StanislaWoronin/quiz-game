import { Injectable } from '@nestjs/common';
import { UsersService } from '../applications/users.service';
import { CreateUserDto } from '../api/dto/create-user.dto';
import { CreatedUser } from '../api/view/created-user';
import { randomUUID } from 'crypto';
import { SqlEmailConfirmation } from '../infrastructure/sql/entity/sql-email-confirmation.entity';

@Injectable()
export class CreateUserBySaUseCase {
  constructor(protected usersService: UsersService) {}

  async execute(dto: CreateUserDto): Promise<CreatedUser> {
    const emailConfirmation = new SqlEmailConfirmation(randomUUID(), true);

    return await this.usersService.createUser(dto, emailConfirmation);
  }
}
