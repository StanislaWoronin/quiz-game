import { faker } from '@faker-js/faker';

export const preparedPassword = {
  valid: 'qwerty123',
  short: { password: faker.random.alpha(5) },
  long: { password: faker.random.alpha(21) },
  newPass: 'newpassword',
};
