import {RegistrationDto} from "../../../src/modules/public/auth/api/dto/registration.dto";
import {CreatedQuestions} from "../../../src/modules/sa/questions/api/view/created-questions";
import {endpoints} from "../routing/routing";
import request from 'supertest';
import {ResendingDto} from "../../../src/modules/public/auth/api/dto/resending.dto";

export class Auth {
    constructor(private readonly server: any) {}

    async registrationUser(
        dto: RegistrationDto
    ): Promise<{ body: CreatedQuestions; status: number }> {
        const response = await request(this.server)
            .post(endpoints.auth.registration)
            .send(dto)

        return { body: response.body, status: response.status };
    }

    async resendingConfirmationCode(
        dto: ResendingDto
    ): Promise<{ body: CreatedQuestions; status: number }> {
        const response = await request(this.server)
            .post(endpoints.auth.registrationEmailResending)
            .send(dto)

        return { body: response.body, status: response.status };
    }

    async confirmRegistration(
        code: string
    ): Promise<{ body: CreatedQuestions; status: number }> {
        const response = await request(this.server)
            .post(endpoints.auth.registrationConfirmation)
            .send({ code })

        return { body: response.body, status: response.status };
    }
}