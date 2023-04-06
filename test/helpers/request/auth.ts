import { RegistrationDto } from '../../../src/modules/public/auth/api/dto/registration.dto';
import { CreatedQuestions } from '../../../src/modules/sa/questions/api/view/created-questions';
import { endpoints } from '../routing/routing';
import request from 'supertest';
import { ResendingDto } from '../../../src/modules/public/auth/api/dto/resending.dto';
import { ErrorsMessages } from '../../../src/common/dto/errors-messages';
import { PasswordRecoveryDto } from '../../../src/modules/public/auth/api/dto/password-recovery.dto';
import { AuthDto } from '../../../src/modules/public/auth/api/dto/auth.dto';
import { faker } from '@faker-js/faker';
import { TokensDto } from '../tokens.dto';
import { TestingRequestDto } from '../testing-request.dto';
import { ViewAboutMe } from '../../../src/modules/public/auth/api/view/view-about-me';
import { LoginType } from '../type/auth/login.type';
import { HttpStatus } from '@nestjs/common';

export class Auth {
  constructor(private readonly server: any) {}

  async registrationUser(
    dto: RegistrationDto,
  ): Promise<TestingRequestDto<CreatedQuestions>> {
    const response = await request(this.server)
      .post(endpoints.auth.registration)
      .send(dto);

    return { body: response.body, status: response.status };
  }

  async resendingConfirmationCode(
    dto: ResendingDto,
  ): Promise<TestingRequestDto<CreatedQuestions>> {
    const response = await request(this.server)
      .post(endpoints.auth.registrationEmailResending)
      .send(dto);

    return { body: response.body, status: response.status };
  }

  async confirmRegistration(
    code: string,
  ): Promise<TestingRequestDto<CreatedQuestions>> {
    const response = await request(this.server)
      .post(endpoints.auth.registrationConfirmation)
      .send({ code });

    return { body: response.body, status: response.status };
  }

  async newPassword(
    password: string,
    code: string,
  ): Promise<TestingRequestDto<ErrorsMessages>> {
    const response = await request(this.server)
      .post(endpoints.auth.newPassword)
      .send({
        newPassword: password,
        recoveryCode: code,
      });

    return { body: response.body, status: response.status };
  }

  async sendPasswordRecovery(
    email: PasswordRecoveryDto,
  ): Promise<TestingRequestDto<ErrorsMessages>> {
    const response = await request(this.server)
      .post(endpoints.auth.passwordRecovery)
      .send(email);

    return { body: response.body, status: response.status };
  }

  async loginUser(dto: AuthDto): Promise<LoginType> {
    const response = await request(this.server)
      .post(endpoints.auth.login)
      .set('User-Agent', faker.internet.userAgent())
      .send(dto);

    if (response.status !== HttpStatus.OK) {
      return { status: response.status };
    }

    return {
      accessToken: response.body.accessToken ?? null,
      refreshToken:
        response.headers['set-cookie'][0].split(';')[0].split('=')[1] ?? null,
      status: response.status,
    };
  }

  async generateToken(refreshToken?: string) {
    const response = await request(this.server)
      .post(endpoints.auth.refreshToken)
      .set('Cookie', `refreshToken=${refreshToken}`);

    if (!response.body.accessToken) {
      return { status: response.status };
    }

    return {
      accessToken: response.body,
      refreshToken: response.headers['set-cookie'][0]
        .split(';')[0]
        .split('=')[1],
      status: response.status,
    };
  }

  async getInfoAboutMe(
    refreshToken?: string,
  ): Promise<TestingRequestDto<ViewAboutMe>> {
    const response = await request(this.server)
      .get(endpoints.auth.me)
      .auth(refreshToken, { type: 'bearer' });

    return { body: response.body, status: response.status };
  }

  async logout(refreshToken?: string): Promise<number> {
    const response = await request(this.server)
      .post(endpoints.auth.logout)
      .set('Cookie', `refreshToken=${refreshToken}`);

    return response.status;
  }
}
