import { Injectable } from '@nestjs/common';
import add from 'date-fns/add';


@Injectable()
export class CreateUserUseCase {
  constructor(
    protected emailManager: EmailManager,
    protected usersService: UsersService,
  ) {}

  async execute(dto: UserDto): Promise<boolean> {
    const userId = uuidv4();
    const emailConfirmation = new EmailConfirmationModel(
      userId,
      uuidv4(),
      add(new Date(), {
        hours: Number(settings.timeLife.CONFIRMATION_CODE),
      }).toISOString(),
      false,
    );

    await this.emailManager.sendConfirmationEmail(
      dto.email,
      emailConfirmation.confirmationCode,
    );
    // console.log(
    //   'confirmationCode:',
    //   emailConfirmation.confirmationCode,
    //   'from use-case for registration',
    // );
    await this.usersService.createUser(dto, emailConfirmation, userId);
    return true;
  }
}
