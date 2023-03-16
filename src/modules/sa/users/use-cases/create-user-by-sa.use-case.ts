import { Injectable } from '@nestjs/common';
import { UsersService } from '../applications/users.service';
import { CreateUserDto } from '../api/dto/create-user.dto';
import { SqlEmailConfirmation } from '../../../public/auth/infrastructure/sql/entity/email-confirmation.entity';
import { CreatedUser } from '../api/view/created-user';

@Injectable()
export class CreateUserBySaUseCase {
  constructor(protected usersService: UsersService) {}

  async execute(dto: CreateUserDto): Promise<CreatedUser> {
    const emailConfirmation = new SqlEmailConfirmation(true);

    return await this.usersService.createUser(dto, emailConfirmation);
  }
}
