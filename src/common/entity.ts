import { Answers } from "../modules/sa/questions/infrastructure/sql/entity/answers.entity";
import { Questions } from "../modules/sa/questions/infrastructure/sql/entity/questions.entity";
import { UserBanInfo } from "../modules/sa/users/infrastructure/sql/entity/ban-info.entity";
import { Users } from "../modules/sa/users/infrastructure/sql/entity/users.entity";
import { Credentials } from "../modules/sa/users/infrastructure/sql/entity/credentials.entity";

export const entity = [
  Answers,
  Credentials,
  Questions,
  UserBanInfo,
  Users
]