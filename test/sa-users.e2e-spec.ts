import { HttpStatus, INestApplication } from '@nestjs/common';
import { Testing } from './helpers/request/testing';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { createApp } from '../src/config/create-app';
import { Users } from './helpers/request/users';
import { preparedSuperUser } from './helpers/prepeared-data/prepared-super-user';
import { preparedUser } from './helpers/prepeared-data/prepared-user';
import { getErrorsMessage } from './helpers/expect-data/expect-errors-messages';
import { expectCreatedUser } from './helpers/expect-data/expect-user';
import { UsersFactory } from './helpers/factories/users-factory';
import { SortByUserField } from '../src/modules/sa/users/api/dto/query/users-sort-field';
import { SortDirection } from '../src/common/pagination/query-parameters/sort-direction';
import { BanStatus } from '../src/modules/sa/users/api/dto/query/ban-status';
import { Auth } from './helpers/request/auth';
import { expectPagination } from './helpers/expect-data/expect-pagination';
import { CreatedUser } from '../src/modules/sa/users/api/view/created-user';
import { getRandomId } from './helpers/helpers';

describe('/sa/users (e2e)', () => {
  const second = 1000;
  jest.setTimeout(5 * second);

  let app: INestApplication;
  let server;

  let testing: Testing;
  let auth: Auth;
  let users: Users;
  let usersFactories: UsersFactory;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const rawApp = await moduleFixture.createNestApplication();
    app = createApp(rawApp);
    await app.init();
    server = await app.getHttpServer();

    users = new Users(server);
    usersFactories = new UsersFactory(users, auth);
    testing = new Testing(server);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST -> sa/users', () => {
    it('Clear all data', async () => {
      await testing.clearDb();
    });

    it('User without permissions try add new user to the system', async () => {
      const request = await users.createUser(
        preparedSuperUser.notValid,
        preparedUser.valid,
      );
      expect(request.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('Try create question with incorrect input data', async () => {
      const errorsMessages = getErrorsMessage(['login', 'password', 'email']);

      const requestWithLongInputData = await users.createUser(
        preparedSuperUser.valid,
        preparedUser.long,
      );
      expect(requestWithLongInputData.status).toBe(HttpStatus.BAD_REQUEST);
      expect(requestWithLongInputData.body).toStrictEqual({ errorsMessages });

      const requestWithShortInputData = await users.createUser(
        preparedSuperUser.valid,
        preparedUser.short,
      );
      expect(requestWithShortInputData.status).toBe(HttpStatus.BAD_REQUEST);
      expect(requestWithShortInputData.body).toStrictEqual({ errorsMessages });
    });

    it('Should create user', async () => {
      const response = await users.createUser(
        preparedSuperUser.valid,
        preparedUser.valid,
      );
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toStrictEqual(expectCreatedUser());
    });
  });

  describe('PUT -> sa/users/:id/ban', () => {
    it('Clear all data', async () => {
      await testing.clearDb();
    });

    it('Create data', async () => {
      const [user] = await usersFactories.createUsers(1);

      expect.setState({
        user,
        userId: user.id,
      });
    });

    it('User without permissions try set ban status', async () => {
      const { userId } = expect.getState();

      const response = await users.setBanStatus(
        preparedSuperUser.notValid,
        preparedUser.updateBanStatus.banned,
        userId,
      );
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('Shouldn`t update if input model is incorrect', async () => {
      const { userId } = expect.getState();
      const errorsMessages = getErrorsMessage(['banReason']);

      const response = await users.setBanStatus(
        preparedSuperUser.valid,
        preparedUser.updateBanStatus.notValid,
        userId,
      );
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body).toStrictEqual({ errorsMessages });
    });

    it('Should update ban status. Set status "true"', async () => {
      const { userId } = expect.getState();

      const response = await users.setBanStatus(
        preparedSuperUser.valid,
        preparedUser.updateBanStatus.banned,
        userId,
      );
      expect(response.status).toBe(HttpStatus.NO_CONTENT);

      const user = await users.getUsers(preparedSuperUser.valid, {});
      expect(user.body.items[0].banInfo.isBanned).toBe(true);
    });

    it('Should update ban status. Set status "false"', async () => {
      const { userId } = expect.getState();

      const response = await users.setBanStatus(
        preparedSuperUser.valid,
        preparedUser.updateBanStatus.unBanned,
        userId,
      );
      expect(response.status).toBe(HttpStatus.NO_CONTENT);

      const user = await users.getUsers(preparedSuperUser.valid, {});
      expect(user.body.items[0].banInfo.isBanned).toBe(false);
    });
  });

  describe('GET -> sa/users', () => {
    it('Clear all data', async () => {
      await testing.clearDb();
    });

    it('Create data', async () => {
      const createdUsers = await usersFactories.createUsers(5);
      const bannedUsers = await usersFactories.crateAndBanUsers(5, 5);

      expect.setState({
        createdUsers,
        bannedUsers,
      });
    });

    it('User without permissions try to get a question', async () => {
      const request = await users.getUsers(preparedSuperUser.notValid, {});
      expect(request.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('Get all question without query', async () => {
      const request = await users.getUsers(preparedSuperUser.valid, {});
      expect(request.status).toBe(HttpStatus.OK);
      expect(request.body.items).toHaveLength(10);
    });

    it('?banStatus=banned&sortBy=login&sortDirection=asc&&pageSize=3', async () => {
      const { bannedUsers } = expect.getState();

      const request = await users.getUsers(preparedSuperUser.valid, {
        banStatus: BanStatus.Banned,
        sortBy: SortByUserField.Login,
        sortDirection: SortDirection.Ascending,
        pageSize: 3,
      });
      expect(request.status).toBe(HttpStatus.OK);
      expect(request.body).toStrictEqual(
        expectPagination([bannedUsers[0], bannedUsers[1], bannedUsers[2]], {
          pagesCount: 2,
          pageSize: 3,
          totalCount: 5,
        }),
      );
    });

    it('?banStatus=notBanned&sortBy=email&sortDirection=desc&pageNumber=2&pageSize=3', async () => {
      const { createdUsers } = expect.getState();

      const request = await users.getUsers(preparedSuperUser.valid, {
        banStatus: BanStatus.NotBanned,
        sortBy: SortByUserField.Email,
        sortDirection: SortDirection.Descending,
        pageNumber: 2,
        pageSize: 3,
      });
      expect(request.status).toBe(HttpStatus.OK);
      expect(request.body).toStrictEqual(
        expectPagination<CreatedUser>([createdUsers[1], createdUsers[0]], {
          pagesCount: 2,
          page: 2,
          pageSize: 3,
          totalCount: 5,
        }),
      );
    });
  });

  describe('DELETE -> "sa/users/:id"', () => {
    it('Clear all data', async () => {
      await testing.clearDb();
    });

    it('Create data', async () => {
      const [user] = await usersFactories.createUsers(1);

      expect.setState({
        userId: user.id,
      });
    });

    it('User without permissions try delete another user', async () => {
      const { userId } = expect.getState();

      const status = await users.deleteUser(preparedSuperUser.notValid, userId);
      expect(status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('Should delete user', async () => {
      const { userId } = expect.getState();

      const status = await users.deleteUser(preparedSuperUser.valid, userId);
      expect(status).toBe(HttpStatus.NO_CONTENT);
    });

    it('Try delete not exist user', async () => {
      const { userId } = expect.getState();
      const randomId = getRandomId();

      const status = await users.deleteUser(preparedSuperUser.valid, randomId);
      expect(status).toBe(HttpStatus.NOT_FOUND);

      const deletedAgain = await users.deleteUser(
        preparedSuperUser.valid,
        userId,
      );
      expect(deletedAgain).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
