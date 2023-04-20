import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RegistrationDto } from '../public/auth/api/dto/registration.dto';
import { BadRequestResponse } from '../../common/dto/errors-messages';
import { AccessToken } from '../public/security/api/view/access-token';
import { ResendingDto } from '../public/auth/api/dto/resending.dto';
import { RegistrationConfirmationDto } from '../public/auth/api/dto/registration-confirmation.dto';
import { PasswordRecoveryDto } from '../public/auth/api/dto/password-recovery.dto';
import { NewPasswordDto } from '../public/auth/api/dto/new-password.dto';
import { ViewAboutMe } from '../public/auth/api/view/view-about-me';
import { AuthDto } from '../public/auth/api/dto/auth.dto';

export function ApiRegistration() {
  return applyDecorators(
    ApiOperation({ summary: 'A new user is registered in the system' }),
    ApiBody({
      type: RegistrationDto,
      required: true,
    }),
    ApiNoContentResponse({
      description:
        'Input data is accepted. Email with confirmation code will be send to passed email address',
    }),
    ApiBadRequestResponse({
      description:
        'If the inputModel has incorrect values (in particular if the user with the given email or password already exists)',
      type: [BadRequestResponse],
    }),
    ApiUnauthorizedResponse({
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}

export function ApiLogin() {
  return applyDecorators(
    ApiOperation({ summary: 'New user login after registration' }),
    ApiBody({ type: AuthDto }),
    ApiOkResponse({
      description:
        'Returns JWT accessToken (expired after 10 seconds) in body and JWT refreshToken in cookie (http-only, secure) (expired after 20 seconds)',
      type: AccessToken,
    }),
    // ApiBadRequestResponse({
    //     description: 'If the inputModel has incorrect values',
    //     type: [BadRequestResponse],
    // }),
    ApiUnauthorizedResponse({
      description: 'If the password or login is wrong',
    }),
    ApiTooManyRequestsResponse({
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}

export function ApiRegistrationEmailResending() {
  return applyDecorators(
    ApiOperation({ summary: 'Re-sends registration confirmation code' }),
    ApiBody({
      type: ResendingDto,
      required: true,
    }),
    ApiNoContentResponse({
      description:
        'Input data is accepted.Email with confirmation code will be send to passed email address.Confirmation code should be inside link as query param, for example: https://some-front.com/confirm-registration?code=youtcodehere',
    }),
    ApiBadRequestResponse({
      description: 'If the inputModel has incorrect values',
      type: [BadRequestResponse],
    }),
    ApiTooManyRequestsResponse({
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}

export function ApiRegistrationConfirmation() {
  return applyDecorators(
    ApiOperation({
      summary: 'Confirmation of registration via confirmation code',
    }),
    ApiBody({
      type: RegistrationConfirmationDto,
      required: true,
    }),
    ApiNoContentResponse({
      description: 'Email was verified. Account was activated',
    }),
    ApiBadRequestResponse({
      description:
        'If the confirmation code is incorrect, expired or already been applied',
      type: [BadRequestResponse],
    }),
    ApiTooManyRequestsResponse({
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}

export function ApiPasswordRecovery() {
  return applyDecorators(
    ApiOperation({ summary: 'Password recovery request' }),
    ApiBody({
      type: PasswordRecoveryDto,
      required: true,
    }),
    ApiNoContentResponse({
      description:
        "Even if current email is not registered (for prevent user's email detection)",
    }),
    ApiBadRequestResponse({
      description:
        'If the inputModel has invalid email (for example 222^gmail.com)',
      type: BadRequestResponse,
    }),
    ApiTooManyRequestsResponse({
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}

export function ApiNewPassword() {
  return applyDecorators(
    ApiOperation({ summary: 'Sending a new password' }),
    ApiBody({
      type: NewPasswordDto,
      required: true,
    }),
    ApiNoContentResponse({
      description: 'If code is valid and new password is accepted',
    }),
    ApiBadRequestResponse({
      description:
        'If the inputModel has incorrect value (for incorrect password length) or RecoveryCode is incorrect or expired',
      type: BadRequestResponse,
    }),
    ApiTooManyRequestsResponse({
      description: 'More than 5 attempts from one IP-address during 10 seconds',
    }),
  );
}

export function ApiRefreshToken() {
  return applyDecorators(
    ApiOperation({ summary: 'Update authorization tokens' }),
    ApiOkResponse({
      description:
        'Returns JWT accessToken (expired after 10 seconds) in body and JWT refreshToken in cookie (http-only, secure) (expired after 20 seconds).',
      type: AccessToken,
    }),
    ApiUnauthorizedResponse({
      description:
        'Returns JWT accessToken (expired after 10 seconds) in body and JWT refreshToken in cookie (http-only, secure) (expired after 20 seconds).',
    }),
  );
}

export function ApiLogout() {
  return applyDecorators(
    ApiOperation({ summary: 'User logout' }),
    ApiNoContentResponse({
      description: 'No Content',
    }),
    ApiUnauthorizedResponse({
      description:
        'If the JWT refreshToken inside cookie is missing, expired or incorrect',
    }),
  );
}

export function ApiAboutMe() {
  return applyDecorators(
    ApiOperation({
      summary: 'An authorized user requests information about their account',
    }),
    ApiBearerAuth(),
    ApiOkResponse({
      description: 'Success',
      type: ViewAboutMe,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}
