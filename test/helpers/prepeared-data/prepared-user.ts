import { faker } from '@faker-js/faker';

export const preparedUser = {
  valid: {
    login: 'UserLogin',
    password: 'qwerty123',
    email: faker.internet.email(),
  },
  long: {
    login: faker.random.alpha(11),
    password: faker.random.alpha(21),
    email: 'somemail.com',
  },
  short: {
    login: faker.random.alpha(2),
    password: faker.random.alpha(5),
    email: 'somemail@com',
  },
  updateBanStatus: {
    banned: {
      isBanned: true,
      banReason: faker.random.alpha(20),
    },
    unBanned: {
      isBanned: false,
      banReason: faker.random.alpha(20),
    },
    notValid: {
      isBanned: false,
      banReason: faker.random.alpha(19),
    },
  },
};

export const prepareLogin = {
  valid: {
    loginOrEmail: 'UserLogin',
    password: 'qwerty123',
  },
  newValid: {
    loginOrEmail: 'UserLogin',
    password: 'newpassword',
  },
  notValid: {
    loginOrEmail: 1,
    password: 1,
  },
  notExist: {
    loginOrEmail: 'NotExist',
    password: 'qwerty',
  },
};
