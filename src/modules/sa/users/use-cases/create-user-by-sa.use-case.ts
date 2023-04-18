import { Injectable } from '@nestjs/common';
import { UsersService } from '../applications/users.service';
import { CreateUserDto } from '../api/dto/create-user.dto';
import { CreatedUser } from '../api/view/created-user';
import { randomUUID } from 'crypto';
import { SqlEmailConfirmation } from '../infrastructure/sql/entity/sql-email-confirmation.entity';
import { EmailConfirmationDto } from '../applications/dto/email-confirmation.dto';

@Injectable()
export class CreateUserBySaUseCase {
  constructor(protected usersService: UsersService) {}

  async execute(dto: CreateUserDto): Promise<CreatedUser> {
    const emailConfirmation = new EmailConfirmationDto(true);

    return await this.usersService.createUser(dto, emailConfirmation);
  }
}
