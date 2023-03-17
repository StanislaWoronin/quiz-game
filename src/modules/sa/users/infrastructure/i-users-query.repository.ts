import { UsersQueryDto } from '../api/dto/query/users-query.dto';
import { ViewPage } from '../../../../common/pagination/view-page';
import { ViewUser } from '../api/view/view-user';
import {SqlCredentials} from "./sql/entity/credentials.entity";
import {SqlUsers} from "./sql/entity/users.entity";

export interface IUsersQueryRepository {
  getUsers(query: UsersQueryDto): Promise<ViewPage<ViewUser>>;
  checkUserExists(userId: string): Promise<boolean>;

  isLoginOrEmailExist(loginOrEmail: string): Promise<boolean>;
  getCredentialByLoginOrEmail(loginOrEmail: string): Promise<SqlCredentials | null>
  getUserByLoginOrEmail(loginOrEmail: string): Promise<SqlUsers | null>
  getUserById(userId: string): Promise<SqlUsers | null>
}

export const IUsersQueryRepository = 'IUsersQueryRepository';
