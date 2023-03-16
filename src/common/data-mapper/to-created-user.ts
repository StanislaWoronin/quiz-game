import { CreatedUser } from '../../modules/sa/users/api/view/created-user';
import { CreatedUserDb } from '../../modules/sa/users/infrastructure/sql/pojo/created-user.db';

export const toCreatedUser = (createdUser: CreatedUserDb): CreatedUser => {
  return {
    id: createdUser.id,
    login: createdUser.login,
    email: createdUser.email,
    createdAt: createdUser.createdAt,
    banInfo: {
      isBanned: false,
      banDate: null,
      banReason: null,
    },
  };
};
