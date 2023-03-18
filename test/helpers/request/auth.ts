import {RegistrationDto} from "../../../src/modules/public/auth/api/dto/registration.dto";
import {CreatedQuestions} from "../../../src/modules/sa/questions/api/view/created-questions";
import {endpoints} from "../routing/routing";
import request from 'supertest';
import {ResendingDto} from "../../../src/modules/public/auth/api/dto/resending.dto";
import { ErrorsMessages } from "../../../src/common/dto/errors-messages";
import { PasswordRecoveryDto } from "../../../src/modules/public/auth/api/dto/password-recovery.dto";
import { AuthDto } from "../../../src/modules/public/auth/api/dto/auth.dto";
import { faker } from "@faker-js/faker";
import { TokensDto } from "../tokens.dto";
import { TestingRequestDto } from "../testing-request.dto";
import { ViewAboutMe } from "../../../src/modules/public/auth/api/view/view-about-me";

export class Auth {
    constructor(private readonly server: any) {}

    async registrationUser(
        dto: RegistrationDto
    ): Promise<TestingRequestDto<CreatedQuestions>> {
        const response = await request(this.server)
            .post(endpoints.auth.registration)
            .send(dto)

        return { body: response.body, status: response.status };
    }

    async resendingConfirmationCode(
        dto: ResendingDto
    ): Promise<TestingRequestDto<CreatedQuestions>> {
        const response = await request(this.server)
            .post(endpoints.auth.registrationEmailResending)
            .send(dto)

        return { body: response.body, status: response.status };
    }

    async confirmRegistration(
        code: string
    ): Promise<TestingRequestDto<CreatedQuestions>> {
        const response = await request(this.server)
            .post(endpoints.auth.registrationConfirmation)
            .send({ code })

        return { body: response.body, status: response.status };
    }

    async newPassword(password: string, code: string): Promise<TestingRequestDto<ErrorsMessages>> {
        const response = await request(this.server)
          .post(endpoints.auth.newPassword)
          .send({
              newPassword: password,
              recoveryCode: code
          })

        return { body: response.body, status: response.status };
    }

    async sendPasswordRecovery(email: PasswordRecoveryDto): Promise<TestingRequestDto<ErrorsMessages>> {
        const response = await request(this.server)
          .post(endpoints.auth.passwordRecovery)
          .send(email)

        return { body: response.body, status: response.status };
    }
    
    async loginUser(
      dto: AuthDto
    ): Promise<TokensDto> {
        const response = await request(this.server)
          .post(endpoints.auth.login)
          .set('User-Agent', faker.internet.userAgent())

        return {
            accessToken: response.body,
            refreshToken: response.headers['set-cookie'][0].split(';')[0],
            status: response.status
        };
    }

    async generateToken(refreshToken?: string): Promise<TokensDto> {
        const response = await request(this.server)
          .post(endpoints.auth.refreshToken)
          .auth(refreshToken, {type: "bearer"})

        return {
            accessToken: response.body,
            refreshToken: response.headers['set-cookie'][0].split(';')[0],
            status: response.status
        };
    }

    async getInfoAboutMe(refreshToken?: string): Promise<TestingRequestDto<ViewAboutMe>> {
        const response = await request(this.server)
          .get(endpoints.auth.me)
          .auth(refreshToken, {type: "bearer"})

        return { body: response.body, status: response.status };
    }

    async logout(refreshToken?: string): Promise<number> {
        const response = await request(this.server)
          .post(endpoints.auth.logout)
          .auth(refreshToken, {type: "bearer"})

        return response.status
    }
}