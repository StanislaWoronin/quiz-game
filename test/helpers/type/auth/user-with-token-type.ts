import { CreatedUser } from '../../../../src/modules/sa/users/api/view/created-user';

export class UserWithTokensType {
  user: CreatedUser;
  accessToken: string;
  refreshToken: string;
}
