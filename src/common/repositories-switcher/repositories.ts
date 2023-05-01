import { QuestionsRepository } from '../../modules/sa/questions/infrastructure/sql/questions.repository';
import { QuestionsQueryRepository } from '../../modules/sa/questions/infrastructure/sql/questions-query.repository';
import { TestingRepository } from '../../modules/testing/infrastructure/sql/testing.repository';
import { UsersRepository } from '../../modules/sa/users/infrastructure/sql/users.repository';
import { UsersQueryRepository } from '../../modules/sa/users/infrastructure/sql/users-query.repository';
import { MUsersRepository } from '../../modules/sa/users/infrastructure/mongoose/m-users.repository';
import { MUsersQueryRepository } from '../../modules/sa/users/infrastructure/mongoose/m-users-query.repository';
import { MTestingRepository } from '../../modules/testing/infrastructure/mongoose/m-testing.repository';
import { MQuestionsQueryRepository } from '../../modules/sa/questions/infrastructure/mongoose/m-questions-query.repository';
import { MQuestionsRepository } from '../../modules/sa/questions/infrastructure/mongoose/m-questions.repository';
import { QuizGameRepository } from '../../modules/public/pair-quiz-game/infrastructure/sql/quiz-game.repository';
import { JwtRepository } from '../../modules/public/auth/infrastructure/sql/jwt.repository';
import { SecurityRepository } from '../../modules/public/security/infrastructure/sql/security.repository';
import { EmailConfirmationRepository } from '../../modules/sa/users/infrastructure/sql/email-confirmation.repository';
import { UserBanInfoRepository } from '../../modules/sa/users/infrastructure/sql/ban-info.repository';
import { SecurityQueryRepository } from '../../modules/public/security/infrastructure/sql/security-query-repository.service';
import { QuizGameQueryRepository } from '../../modules/public/pair-quiz-game/infrastructure/sql/quiz-game-query.repository';
import { MBanInfoRepository } from '../../modules/sa/users/infrastructure/mongoose/m-ban-info.repository';
import { MEmailConfirmationRepository } from '../../modules/sa/users/infrastructure/mongoose/m-email-confirmation.repository';
import { MJwtRepository } from '../../modules/public/auth/infrastructure/mongoose/m-jwt.repository';
import { MQuizGameRepository } from '../../modules/public/pair-quiz-game/infrastructure/mongo/m-quiz-game.repository';
import { MQuizGameQueryRepository } from '../../modules/public/pair-quiz-game/infrastructure/mongo/m-quiz-game-query.repository';
import { MSecurityRepository } from '../../modules/public/security/infrastructure/mongo/m-security.repository';
import { MSecurityQueryRepository } from '../../modules/public/security/infrastructure/mongo/m-security-query.repository';

export const repositories = {
  sql: {
    banInfoRepository: UserBanInfoRepository,
    emailConfirmation: EmailConfirmationRepository,
    gameRepository: QuizGameRepository,
    gameQueryRepository: QuizGameQueryRepository,
    questionsRepository: QuestionsRepository,
    questionsQueryRepository: QuestionsQueryRepository,
    jwt: JwtRepository,
    testingRepository: TestingRepository,
    securityRepository: SecurityRepository,
    securityQueryRepository: SecurityQueryRepository,
    usersRepository: UsersRepository,
    usersQueryRepository: UsersQueryRepository,
  },
  mongo: {
    banInfoRepository: MBanInfoRepository,
    emailConfirmation: MEmailConfirmationRepository,
    gameRepository: MQuizGameRepository,
    gameQueryRepository: MQuizGameQueryRepository,
    questionsRepository: MQuestionsRepository,
    questionsQueryRepository: MQuestionsQueryRepository,
    jwt: MJwtRepository,
    testingRepository: MTestingRepository,
    securityRepository: MSecurityRepository,
    securityQueryRepository: MSecurityQueryRepository,
    usersRepository: MUsersRepository,
    usersQueryRepository: MUsersQueryRepository,
  },
};
