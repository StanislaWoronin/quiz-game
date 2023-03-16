import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { RegistrationDto } from './dto/registration.dto';
import { CreateUserUseCase } from '../../../sa/users/use-cases/create-user.use-case';

@Controller('auth')
export class AuthController {
  constructor(protected createUserUseCase: CreateUserUseCase) {}

  // @Throttle(5, 10)
  // @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  async registration(@Body() dto: RegistrationDto) {
    return await this.createUserUseCase.execute(dto);
  }
}
