import { ViewUser } from '../../modules/sa/users/api/view/view-user';
import { UserWithBanInfoDb } from '../../modules/sa/users/infrastructure/sql/pojo/user-with-ban-info.db';

export const toViewUser = (user: UserWithBanInfoDb): ViewUser => {
  let isBanned = false;
  if (user.banDate) {
    isBanned = true;
  }

  return {
    id: user.id,
    login: user.login,
    email: user.email,
    createdAt: user.createdAt,
    banInfo: {
      isBanned: isBanned,
      banDate: user.banDate ?? null,
      banReason: user.banReason ?? null,
    },
  };
};
