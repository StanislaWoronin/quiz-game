import { HttpStatus, INestApplication } from '@nestjs/common';
import { createApp } from '../src/config/create-app';
import { EmailManager } from '../src/modules/public/auth/email-transfer/email.manager';
import { AppModule } from '../src/app.module';
import { Test, TestingModule } from '@nestjs/testing';
import { EmailManagerMock } from './mock/email-adapter.mock';
import { Testing } from './helpers/request/testing';
import { Auth } from './helpers/request/auth';
import {
  preparedUser,
  prepareLogin,
} from './helpers/prepeared-data/prepared-user';
import { getErrorsMessage } from './helpers/expect-data/expect-errors-messages';
import { Users } from './helpers/request/users';
import { preparedSuperUser } from './helpers/prepeared-data/prepared-super-user';
import { preparedSecurity } from './helpers/prepeared-data/prepared-security';
import { getErrorMessage } from './helpers/routing/errors-messages';
import { randomUUID } from 'crypto';
import { preparedPassword } from './helpers/prepeared-data/prepared-password';
import { ViewAboutMe } from '../src/modules/public/auth/api/view/view-about-me';
import { faker } from '@faker-js/faker';

describe('/auth', () => {
  const second = 1000;
  jest.setTimeout(5 * second);

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
    const errorsMessages = getErrorsMessage(['login', 'password', 'email']);

    it('Shouldn`t registration user with incorrect input data', async () => {
      const shortInputData = await auth.registrationUser(preparedUser.short);
      expect(shortInputData.status).toBe(HttpStatus.BAD_REQUEST);
      expect(shortInputData.body).toStrictEqual({ errorsMessages });

      const longInputData = await auth.registrationUser(preparedUser.long);
      expect(longInputData.status).toBe(HttpStatus.BAD_REQUEST);
      expect(longInputData.body).toStrictEqual({ errorsMessages });
    });

    it('Should registrate user', async () => {
      const response = await auth.registrationUser(preparedUser.valid);

      expect(response.status).toBe(HttpStatus.NO_CONTENT);

      const user = await users.getUsers(preparedSuperUser.valid, {});
      expect(user.body.items).toHaveLength(1);

      expect.setState({ user: user.body.items[0] });
    });

    it('Should`t registrate if login or email already exists', async () => {
      const errorsMessages = getErrorsMessage(['login', 'email']);

      const response = await auth.registrationUser(preparedUser.valid);
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toStrictEqual({ errorsMessages });
    });
  });

  describe('POST -> "/auth/registration-email-resending"', () => {
    const errorsMessages = getErrorsMessage(['email']);

    it('Should`t resending confirmation code, if incorrect input data', async () => {
      const response1 = await auth.resendingConfirmationCode({
        email: preparedUser.short.email,
      });
      expect(response1.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response1.body).toStrictEqual({ errorsMessages });

      const response2 = await auth.resendingConfirmationCode({
        email: preparedUser.long.email,
      });
      expect(response2.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response2.body).toStrictEqual({ errorsMessages });
    });

    it('Should`t resending confirmation code, if email not registrated', async () => {
      const response = await auth.resendingConfirmationCode({
        email: faker.internet.email(),
      });
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toStrictEqual({ errorsMessages });
    });

    it('Should resending confirmation code', async () => {
      const { user } = expect.getState();

      const oldConfirmationCode = testing.getConfirmationCode(user.id);

      const response = await auth.resendingConfirmationCode({
        email: user.email,
      });
      expect(response.status).toBe(HttpStatus.NO_CONTENT);

      const newConfirmationCode = await testing.getConfirmationCode(user.id);
      expect(oldConfirmationCode).not.toEqual(newConfirmationCode);

      expect.setState({ confirmationCode: newConfirmationCode });
    });
  });

  describe('POST -> "/auth/registration-confirmation"', () => {
    const errorsMessages = getErrorsMessage(['code']);
    it('Shouldn`t confirmed if the confirmation code is incorrect', async () => {
      const { confirmationCode } = expect.getState();
      const response = await auth.confirmRegistration(`${confirmationCode}-1`);
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('Shouldn`t confirmed if the confirmation code is expired', async () => {
      const { user } = expect.getState();

      await testing.makeExpired(user.id);
      const confirmationCode = await testing.getConfirmationCode(user.id);

      const response = await auth.confirmRegistration(confirmationCode);
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toEqual({ errorsMessages });
    });

    it('Email was verified. Account was activated', async () => {
      const { user } = expect.getState();
      await auth.resendingConfirmationCode({ email: user.email });
      const confirmationCode = await testing.getConfirmationCode(user.id);

      await auth.confirmRegistration(confirmationCode);
      const isConfirmed = await testing.checkConfirmationStatus(user.id);
      expect(isConfirmed).toBeTruthy();

      expect.setState({ confirmationCode: confirmationCode });
    });

    it('Shouldn`t confirmed if the confirmation code is already been applied', async () => {
      const { confirmationCode } = expect.getState();

      const response = await auth.confirmRegistration(confirmationCode);
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toEqual({ errorsMessages });
    });
  });

  describe('POST -> "/auth/password-recovery"', () => {
    const errorsMessages = getErrorsMessage(['email']);
    it('Shouldn`t send password recovery if input data has invalid email', async () => {
      const response = await auth.sendPasswordRecovery(
        preparedSecurity.email.notValid,
      );
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toEqual({ errorsMessages });
    });

    it(
      'Shouldn`t return error even if current email is not' +
        'registered (for prevent user`s email detection)',
      async () => {
        const response = await auth.sendPasswordRecovery(
          preparedSecurity.email.notExist,
        );
        expect(response.status).toBe(HttpStatus.NO_CONTENT);
      },
    );

    it('Should update confirmation code', async () => {
      const { user, confirmationCode } = expect.getState();

      const response = await auth.sendPasswordRecovery(
        preparedSecurity.email.valid,
      );
      expect(response.status).toBe(HttpStatus.NO_CONTENT);

      const newRecoveryCode = await testing.getConfirmationCode(user.id);
      expect(confirmationCode).not.toEqual(newRecoveryCode);
    });
  });

  describe('POST -> "/auth/new-password"', () => {
    it('Shouldn`t confirm password recovery if incorrect input dat', async () => {
      const errorsMessages = getErrorMessage(['newPassword', 'recoveryCode']);
      const randomCode = randomUUID();

      const response = await auth.newPassword(
        preparedPassword.long.password,
        randomCode,
      );
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toEqual({ errorsMessages });
    });

    it('Shouldn`t confirm password recovery if recovery code expired', async () => {
      const { user } = expect.getState();
      const errorsMessages = getErrorMessage(['newPassword']);

      await testing.makeExpired(user.id);
      const expiredCode = await testing.getConfirmationCode(user.id);

      const response = await auth.newPassword(
        preparedPassword.long.password,
        expiredCode,
      );
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toEqual({ errorsMessages });
    });

    it('Confirm password recovery', async () => {
      const { user } = expect.getState();

      await auth.sendPasswordRecovery({ email: preparedUser.valid.email });
      const confirmationCode = await testing.getConfirmationCode(user.id);

      await auth.newPassword(preparedPassword.newPass, confirmationCode);

      const newPassword = await testing.getUserPassword(user.id);
      expect(preparedUser.valid.password).not.toEqual(newPassword);
    });
  });

  describe('POST -> "/auth/login"', () => {
    it('Shouldn`t login if the password or login is wrong', async () => {
      const response = await auth.loginUser(prepareLogin.notExist);
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('Should login and return token', async () => {
      const response = await auth.loginUser(prepareLogin.valid);
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.accessToken).toBeTruthy();
      expect(response.refreshToken).toBeTruthy();

      expect.setState({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
    });
  });

  describe('POST -> "/auth/refresh-token"', () => {
    it(
      'Shouldn`t generate new pair token if the JWT refreshToken' +
        'inside cookie is missing',
      async () => {
        const response = await auth.generateToken();
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      },
    );

    it(
      'Shouldn`t generate new pair token if the JWT refreshToken' +
        'inside cookie is incorrect',
      async () => {
        const { refreshToken } = expect.getState();

        const response = await auth.generateToken(`a1-${refreshToken}-1a`);
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      },
    );

    it(
      'Shouldn`t generate new pair token if the JWT' +
        'inside cookie is expired',
      async () => {
        const { refreshToken } = expect.getState();

        const expiredToken = await testing.makeExpired(refreshToken);

        const second = 1000;
        jest.setTimeout(second);
        // schedule('1,*,*,*,*,*', () => {})

        const response = await auth.generateToken(expiredToken);
        expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      },
    );

    it('Should return new pair of access and refresh token', async () => {
      const { refreshToken } = expect.getState();

      const response = await auth.generateToken(refreshToken);
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.accessToken).toBeTruthy();
      expect(response.refreshToken).toBeTruthy();

      expect.setState({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
    });
  });

  describe('POST -> "/auth/me"', () => {
    // it('Shouldn`t return info about user if unauthorized', async () => {
    //     const response = await auth.getInfoAboutMe()
    //     expect(response.status).toBe(HttpStatus.UNAUTHORIZED)
    // })

    it('Return info about user', async () => {
      const { user, refreshToken } = expect.getState();

      const response = await auth.getInfoAboutMe(refreshToken);
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual(new ViewAboutMe(user));
    });
  });

  describe('POST -> "/auth/logout"', () => {
    it('Shouldn`t logout if refresh token missing', async () => {
      const response = await auth.logout();
      expect(response).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('Shouldn`t logout if refresh token is incorrect', async () => {
      const { refreshToken } = expect.getState();

      const response = await auth.logout(`a1-${refreshToken}-1a`);
      expect(response).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('Shouldn`t logout if refresh token is expired', async () => {
      const { refreshToken } = expect.getState();

      const expiredToken = await testing.makeExpired(refreshToken);

      const second = 1000;
      jest.setTimeout(second);
      //schedule('1,*,*,*,*,*', () => {})

      const response = await auth.logout(expiredToken);
      expect(response).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('Should logout from sistem', async () => {
      const newTokens = await auth.loginUser(prepareLogin.valid);

      const response = await auth.logout(newTokens.refreshToken);
      expect(response).toBe(HttpStatus.NO_CONTENT);

      const tryLoginAfterLogout = await auth.logout(newTokens.refreshToken);
      expect(tryLoginAfterLogout).toBe(HttpStatus.UNAUTHORIZED);
    });
  });
});
