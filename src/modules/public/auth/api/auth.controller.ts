import {
  applyDecorators,
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
import {Request, Response} from 'express';
import {RegistrationDto} from './dto/registration.dto';
import {CreateUserUseCase} from '../../../sa/users/use-cases/create-user.use-case';
import {AuthDto} from './dto/auth.dto';
import {UserId} from '../../../../common/decorators/user.decorator';
import {ConfigService} from '@nestjs/config';
import {CheckCredentialGuard} from '../guards/check-credential.guard';
import {SecurityService} from '../../security/application/security.service';
import {PasswordRecoveryDto} from './dto/password-recovery.dto';
import {NewPasswordDto} from './dto/new-password.dto';
import {AuthService} from '../applications/auth.service';
import {UsersService} from '../../../sa/users/applications/users.service';
import {RefreshTokenValidationGuard} from '../guards/refresh-token-validation.guard';
import {AuthBearerGuard} from '../guards/auth-bearer.guard';
import {ResendingDto} from './dto/resending.dto';
import {RegistrationConfirmationDto} from './dto/registration-confirmation.dto';
import {EmailManager} from '../email-transfer/email.manager';
import {IEmailConfirmationRepository} from '../../../sa/users/infrastructure/i-email-confirmation.repository';
import {IUsersQueryRepository} from '../../../sa/users/infrastructure/i-users-query.repository';
import {ViewAboutMe} from './view/view-about-me';
import {AccessToken} from '../../security/api/view/access-token';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import {BadRequestResponse} from '../../../../common/dto/errors-messages';

export function ApiRegistration() {
  return applyDecorators(
    ApiOperation({summary: 'A new user is registered in the system'}),
    ApiBody({type: RegistrationDto}),
    ApiNoContentResponse({
      description:
        'Input data is accepted. Email with confirmation code will be send to passed email address',
    }),
    ApiBadRequestResponse({
      description:
        'If the inputModel has incorrect values (in particular if the user with the given email or password already exists)',
      type: [BadRequestResponse],
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    })
  );
}

@ApiTags('Auth')
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

  @ApiRegistration()
  // @Throttle(5, 10)
  // @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration')
  async registration(@Body() dto: RegistrationDto) {
    return await this.createUserUseCase.execute(dto);
  }

  @ApiOperation({summary: 'New user login after registration'})
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Returns JWT accessToken (expired after 10 seconds) in body and JWT refreshToken in cookie (http-only, secure) (expired after 20 seconds)',
    type: AccessToken,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'If the inputModel has incorrect values',
    type: [BadRequestResponse],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'If the password or login is wrong',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
  //@Throttle(5, 10)
  @UseGuards(/*ThrottlerGuard, */ CheckCredentialGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
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
      .send({accessToken: tokens.accessToken});
  }

  @ApiOperation({summary: 'Re-sends registration confirmation code'})
  @ApiBody({type: ResendingDto})
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description:
      'Input data is accepted.Email with confirmation code will be send to passed email address.Confirmation code should be inside link as query param, for example: https://some-front.com/confirm-registration?code=youtcodehere',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'If the inputModel has incorrect values',
    type: [BadRequestResponse],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
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

  @ApiOperation({
    summary: 'Confirmation of registration via confirmation code',
  })
  @ApiBody({type: RegistrationConfirmationDto})
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Email was verified. Account was activated',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'If the confirmation code is incorrect, expired or already been applied',
    type: [BadRequestResponse],
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'More than 5 attempts from one IP-address during 10 seconds',
  })
  // @Throttle(5, 10)
  // @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('registration-confirmation')
  async registrationConfirmation(@Body() dto: RegistrationConfirmationDto) {
    return await this.emailConfirmationRepository.updateConfirmationInfo(
      dto.code,
    );
  }

  @ApiOperation({summary: 'Password recovery request'})
  @ApiResponse({status: HttpStatus.NO_CONTENT})
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

  @ApiOperation({summary: 'Sending a new password'})
  @ApiResponse({status: HttpStatus.NO_CONTENT})
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

  @ApiOperation({summary: 'Update authorization tokens'})
  @ApiResponse({status: HttpStatus.OK, type: AccessToken})
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
      .send({accessToken: tokens.accessToken});
  }

  @ApiOperation({summary: 'User logout'})
  @ApiResponse({status: HttpStatus.NO_CONTENT})
  @UseGuards(RefreshTokenValidationGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(@Req() req: Request) {
    await this.securityService.logoutFromCurrentSession(
      req.cookies.refreshToken,
    );

    return;
  }

  @ApiOperation({
    summary: 'An authorized user requests information about their account',
  })
  @ApiResponse({status: HttpStatus.OK})
  @UseGuards(AuthBearerGuard)
  @Get('me')
  async aboutMe(@UserId() userId: string): Promise<ViewAboutMe> {
    const user = await this.queryUsersRepository.getUserById(userId);

    return new ViewAboutMe(user);
  }
}
