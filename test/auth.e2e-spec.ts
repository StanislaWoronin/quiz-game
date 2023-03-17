import {HttpStatus, INestApplication} from "@nestjs/common";
import {createApp} from "../src/config/create-app";
import {EmailManager} from "../src/modules/public/auth/email-transfer/email.manager";
import {AppModule} from "../src/app.module";
import {Test, TestingModule} from "@nestjs/testing";
import {EmailManagerMock} from "./mock/email-adapter.mock";
import {Testing} from "./helpers/request/testing";
import {Auth} from "./helpers/request/auth";
import {preparedUser} from "./helpers/prepeared-data/prepared-user";
import {getErrorsMessage} from "./helpers/expect-data/expect-errors-messages";
import {Users} from "./helpers/request/users";
import {preparedSuperUser} from "./helpers/prepeared-data/prepared-super-user";

describe('/auth', () => {
    const second = 1000;
    jest.setTimeout(30 * second);

    let app: INestApplication;
    let server;

    let auth: Auth;
    let testing: Testing;
    let users: Users;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(EmailManager)
            .useValue(new EmailManagerMock())
            .compile();

        const rawApp = await moduleFixture.createNestApplication();
        app = createApp(rawApp);
        await app.init();
        server = await app.getHttpServer();

        auth = new Auth(server);
        testing = new Testing(server);
        users = new Users(server);
    });

    afterAll(async () => {
        await app.close();
    });

    it('Drop all data.', async () => {
        await testing.clearDb();
    });

    describe('POST -> "/auth/registration"', () => {
        const errorsMessages = getErrorsMessage(['login', 'password', 'email'])

        it('Shouldn`t registration user with incorrect input data', async () => {
            const shortInputData = await auth.registrationUser(preparedUser.short)
            expect(shortInputData.status).toBe(HttpStatus.BAD_REQUEST)
            expect(shortInputData.body).toStrictEqual({ errorsMessages })

            const longInputData = await auth.registrationUser(preparedUser.long)
            expect(longInputData.status).toBe(HttpStatus.BAD_REQUEST)
            expect(longInputData.body).toStrictEqual({ errorsMessages })
        })

        it('Should registrate user', async () => {
            const response = await auth.registrationUser(preparedUser.valid)
            expect(response.status).toBe(HttpStatus.NO_CONTENT)

            const user = await users.getUsers(preparedSuperUser.valid, {})
            expect(user.body.items).toHaveLength(1);

            expect.setState({ user: user.body.items[0]})
        })

        it('Should`t registrate if login or email already exists', async () => {
            const response = await auth.registrationUser(preparedUser.valid)
            expect(response.status).toBe(HttpStatus.BAD_REQUEST)
            expect(response.body).toStrictEqual({ errorsMessages })
        })
    })

    describe('POST -> "/auth/registration-email-resending"', () => {
        const errorsMessages = getErrorsMessage(['email'])
        it('Should`t resending confirmation code, if incorrect input data', async () => {
            const response1 = await auth.resendingConfirmationCode({ email: preparedUser.short.email })
            expect(response1.status).toBe(HttpStatus.BAD_REQUEST)
            expect(response1.body).toStrictEqual({ errorsMessages })

            const response2 = await auth.resendingConfirmationCode({ email: preparedUser.long.email })
            expect(response2.status).toBe(HttpStatus.BAD_REQUEST)
            expect(response2.body).toStrictEqual({ errorsMessages })
        })

        it('Should`t resending confirmation code, if email not registrated', async () => {
            const response = await auth.resendingConfirmationCode({ email: preparedUser.valid.email })
            expect(response.status).toBe(HttpStatus.BAD_REQUEST)
            expect(response.body).toStrictEqual({ errorsMessages })
        })

        it('Should resending confirmation code', async () => {
            const {user} = expect.getState()

            const oldConfirmationCode = testing.getConfirmationCode(user.id)

            const response = await auth.resendingConfirmationCode({ email: user.email })
            expect(response.status).toBe(HttpStatus.NO_CONTENT)

            const newConfirmationCode = testing.getConfirmationCode(user.id)
            expect(oldConfirmationCode).not.toEqual(newConfirmationCode)

            expect.setState({ confirmationCode: newConfirmationCode });
        })
    })

    describe('POST -> "/auth/registration-confirmation"', () => {
        const {user, confirmationCode} = expect.getState()
        const errorsMessages = getErrorsMessage(['code'])
        it('Shouldn`t confirmed if the confirmation code is incorrect', async () => {
            const response = await auth.confirmRegistration(`${confirmationCode}-1`)
            expect(response.status).toBe(HttpStatus.BAD_REQUEST)
        })

        it('Shouldn`t confirmed if the confirmation code is expired', async () => {
            await testing.makeExpired(user.id)
            const confirmationCode = await testing.getConfirmationCode(user.id)

            const response = await auth.confirmRegistration(confirmationCode)
            expect(response.status).toBe(HttpStatus.BAD_REQUEST)
            expect(response.body).toEqual({ errorsMessages })
        })

        it('Email was verified. Account was activated', async () => {
            await auth.resendingConfirmationCode({ email: user.email })
            const confirmationCode = await testing.getConfirmationCode(user.id)

            await auth.confirmRegistration(confirmationCode)
            const isConfirmed = await testing.checkConfirmationStatus(user.id)
            expect(isConfirmed).toBeTruthy()

            expect.setState({ confirmationCode: confirmationCode });
        })

        it('Shouldn`t confirmed if the confirmation code is already been applied', async () => {
            const {confirmationCode} = expect.getState();

            const response = await auth.confirmRegistration(confirmationCode)
            expect(response.status).toBe(HttpStatus.BAD_REQUEST)
            expect(response.body).toEqual({ errorsMessages })
        })
    })

    describe('POST -> "/auth/password-recovery"', () => {

    })

    describe('POST -> "/auth/login"', () => {

    })

    describe('POST -> "/auth/new-password"', () => {

    })

    describe('POST -> "/auth/refresh-token"', () => {

    })

    describe('POST -> "/auth/me"', () => {

    })
})