import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Ip,
  NotFoundException,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { RegistrationDto } from './dto/registration.dto';
import { CreateUserUseCase } from '../../../sa/users/use-cases/create-user.use-case';
import { AuthDto } from './dto/auth.dto';
import { UserId } from '../../../../common/decorators/user.decorator';
import { ConfigService } from '@nestjs/config';
import { CheckCredentialGuard } from '../guards/check-credential.guard';
import { SecurityService } from '../../security/application/security.service';
import { PasswordRecoveryDto } from './dto/password-recovery.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import { AuthService } from '../applications/auth.service';
import { UsersService } from '../../../sa/users/applications/users.service';
import { RefreshTokenValidationGuard } from '../guards/refresh-token-validation.guard';
import { AuthBearerGuard } from '../guards/auth-bearer.guard';
import { ResendingDto } from './dto/resending.dto';
import { RegistrationConfirmationDto } from './dto/registration-confirmation.dto';
import { EmailManager } from '../email-transfer/email.manager';
import { IEmailConfirmationRepository } from '../../../sa/users/infrastructure/i-email-confirmation.repository';
import { IUsersQueryRepository } from '../../../sa/users/infrastructure/i-users-query.repository';
import { ViewAboutMe } from './view/view-about-me';
import { AccessToken } from '../../security/api/view/access-token';

@Controller('auth')
export class AuthController {
  isDev: boolean;

  constructor(
    private readonly config: ConfigService,
    protected createUserUseCase: CreateUserUseCase,
    protected emailManager: EmailManager,
    protected authService: AuthService,
    protected securityService: SecurityService,
    protected userService: UsersService,
    @Inject(IEmailConfirmationRepository)
    protected emailConfirmationRepository: IEmailConfirmationRepository,
    @Inject(IUsersQueryRepository)
    protected queryUsersRepository: IUsersQueryRepository,
  ) {
    this.isDev = config.get<boolean>('environment');
  }

  // @Throttle(5, 10)
  // @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  async registration(@Body() dto: RegistrationDto) {
    return await this.createUserUseCase.execute(dto);
  }

  //@Throttle(5, 10)
  @UseGuards(/*ThrottlerGuard, */ CheckCredentialGuard)
  @Post('login')
  @HttpCode(200)
  async createUser(
    @Body() dto: AuthDto,
    @Ip() ipAddress: string,
    @UserId() userId: string,
    @Headers('user-agent') title: string,
    @Res() res: Response,
  ) /*: Promise<AccessToken>*/ {
    const tokens = await this.securityService.createUserDevice(
      userId,
      title,
      ipAddress,
    );

    return res
      .cookie('refreshToken', tokens.refreshToken, {
        httpOnly: !this.isDev,
        secure: !this.isDev,
        maxAge: 24 * 60 * 60 * 1000,
      })
      .send({ accessToken: tokens.accessToken });
  }

  // @Throttle(5, 10)
  // @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-email-resending')
  async registrationEmailResending(
    @Body() email: ResendingDto,
    @UserId() userId: string,
  ) {
    const newConfirmationCode = await this.authService.updateConfirmationCode(
      userId,
    );

    return await this.emailManager.sendConfirmationEmail(
      email.email,
      newConfirmationCode,
    );
  }

  // @Throttle(5, 10)
  // @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  async registrationConfirmation(@Body() dto: RegistrationConfirmationDto) {
    return await this.emailConfirmationRepository.updateConfirmationInfo(
      dto.code,
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('password-recovery')
  async passwordRecovery(@Body() dto: PasswordRecoveryDto) {
    const user = await this.queryUsersRepository.getUserByLoginOrEmail(
      dto.email,
    );

    if (user) {
      await this.authService.sendPasswordRecovery(user.id, dto.email);
    }

    return;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('new-password')
  async createNewPassword(
    @Body() dto: NewPasswordDto,
    @UserId() userId: string,
  ) {
    const user = await this.queryUsersRepository.checkUserExists(userId);

    if (!user) {
      throw new NotFoundException();
    }

    await this.userService.updateUserPassword(userId, dto.newPassword);

    return;
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenValidationGuard)
  @Post('refresh-token')
  async createRefreshToken(@Req() req: Request, @Res() res: Response) {
    const tokens = await this.securityService.createNewRefreshToken(
      req.cookies.refreshToken,
    );

    return res
      .cookie('refreshToken', tokens.refreshToken, {
        httpOnly: !this.isDev,
        secure: !this.isDev,
        maxAge: 24 * 60 * 60 * 1000,
      })
      .send({ accessToken: tokens.accessToken });
  }

  @UseGuards(RefreshTokenValidationGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(@Req() req: Request) {
    await this.securityService.logoutFromCurrentSession(
      req.cookies.refreshToken,
    );

    return;
  }

  @UseGuards(AuthBearerGuard)
  @Get('me')
  async aboutMe(@UserId() userId: string): Promise<ViewAboutMe> {
    const user = await this.queryUsersRepository.getUserById(userId);

    return new ViewAboutMe(user);
  }
}
