import { preparedUser } from './prepared-user';

export const preparedSecurity = {
  email: {
    valid: { email: preparedUser.valid.email },
    notValid: { email: '222^gmail.com' },
    notExist: { email: 'notexist@mail.com' },
  },
};
