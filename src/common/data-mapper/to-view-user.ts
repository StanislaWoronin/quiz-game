import { ViewUser } from '../../modules/sa/users/api/view/view-user';
import { UserWithBanInfoDb } from '../../modules/sa/users/infrastructure/sql/pojo/user-with-ban-info.db';

export const toViewUser = (user: UserWithBanInfoDb): ViewUser => {
  return {
    id: user.id,
    login: user.login,
    email: user.email,
    createdAt: user.createdAt,
    banInfo: {
      isBanned: user.isBanned ?? false,
      banDate: user.banDate ?? null,
      banReason: user.banReason ?? null,
    },
  };
};
