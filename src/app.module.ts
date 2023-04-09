import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {QuestionsController} from './modules/sa/questions/api/questions.controller';
import {QuestionsService} from './modules/sa/questions/applications/questions.servise';
import {IQuestionsQueryRepository} from './modules/sa/questions/infrastructure/i-questions-query.repository';
import {IQuestionsRepository} from './modules/sa/questions/infrastructure/i-questions.repository';
import {repositorySwitcher} from './common/repositories-switcher/repositories-switcher';
import {settings} from './settings';
import {repositoryName} from './common/repositories-switcher/repository-name';
import {ITestingRepository} from './modules/testing/infrastructure/i-testing.repository';
import {TestingController} from './modules/testing/api/testing.controller';
import {IUsersRepository} from './modules/sa/users/infrastructure/i-users.repository';
import {IUsersQueryRepository} from './modules/sa/users/infrastructure/i-users-query.repository';
import {UsersService} from './modules/sa/users/applications/users.service';
import {UsersController} from './modules/sa/users/api/users.controller';
import {SqlCredentials} from './modules/sa/users/infrastructure/sql/entity/credentials.entity';
import {SqlQuestions} from './modules/sa/questions/infrastructure/sql/entity/questions.entity';
import {SqlUserBanInfo} from './modules/sa/users/infrastructure/sql/entity/ban-info.entity';
import {SqlUsers} from './modules/sa/users/infrastructure/sql/entity/users.entity';
import {MongoUsers, UserSchema,} from './modules/sa/users/infrastructure/mongoose/schema/userSchema';
import {
  MongoUserBanInfo,
  UserBanInfoSchema,
} from './modules/sa/users/infrastructure/mongoose/schema/user-ban-info.schema';
import {CredentialSchema, MongoCredentials,} from './modules/sa/users/infrastructure/mongoose/schema/credential.schema';
import {AnswerSchema, MongoAnswers,} from './modules/sa/questions/infrastructure/mongoose/schema/answerSchema';
import {MongoQuestion, QuestionSchema,} from './modules/sa/questions/infrastructure/mongoose/schema/question.schema';
import {configSwitcher} from './config/config-switcher';
import {IJwtRepository} from './modules/public/auth/infrastructure/i-jwt.repository';
import {PairQuizGameService} from './modules/public/pair-quiz-game/applications/pair-quiz-game.service';
import {IQuizGameRepository} from './modules/public/pair-quiz-game/infrastructure/i-quiz-game.repository';
import {SqlGame} from './modules/public/pair-quiz-game/infrastructure/sql/entity/sql-game.entity';
import {SqlGameProgress} from './modules/public/pair-quiz-game/infrastructure/sql/entity/sql-game-progress.entity';
import {JwtService} from './modules/public/auth/applications/jwt.service';
import {IQuizGameQueryRepository} from './modules/public/pair-quiz-game/infrastructure/i-quiz-game-query.repository';
import {SqlUserAnswer} from './modules/public/pair-quiz-game/infrastructure/sql/entity/sql-user-answer.entity';
import {JwtService as NestJwtService} from '@nestjs/jwt/dist/jwt.service';
import {CreateUserUseCase} from './modules/sa/users/use-cases/create-user.use-case';
import {CreateUserBySaUseCase} from './modules/sa/users/use-cases/create-user-by-sa.use-case';
import {EmailExistValidator} from './common/validators/email-exists.validator';
import {LoginExistValidator} from './common/validators/login-exist.validator';
import {EmailAdapters} from './modules/public/auth/email-transfer/email.adapter';
import {EmailManager} from './modules/public/auth/email-transfer/email.manager';
import {SqlSecurity} from './modules/public/security/infrastructure/sql/entity/security';
import {ISecurityRepository} from './modules/public/security/infrastructure/i-security.repository';
import {AuthController} from './modules/public/auth/api/auth.controller';
import {AuthService} from './modules/public/auth/applications/auth.service';
import {IEmailConfirmationRepository} from './modules/sa/users/infrastructure/i-email-confirmation.repository';
import {IUserBanInfoRepository} from './modules/sa/users/infrastructure/i-user-ban-info.repository';
import {SecurityService} from './modules/public/security/application/security.service';
import {ISecurityQueryRepository} from './modules/public/security/infrastructure/i-security-query.repository';
import {EmailResendingValidator} from './common/validators/email-resending.validator';
import {ConfirmationCodeValidator} from './common/validators/confirmation-code.validator';
import {PasswordRecoveryValidator} from './modules/public/auth/guards/password-recovery.validator';
import {SqlTokenBlackList} from './modules/public/auth/infrastructure/sql/entity/sql-token-black-list.entity';
import {SqlEmailConfirmation} from './modules/sa/users/infrastructure/sql/entity/sql-email-confirmation.entity';
import {SqlGameQuestions} from './modules/public/pair-quiz-game/infrastructure/sql/entity/sql-game-questions.entity';
import {PairQuizGameUsersController} from "./modules/public/pair-quiz-game/api/pair-quiz-game-users.controller";
import {PairQuizGamePairsController} from "./modules/public/pair-quiz-game/api/pair-quiz-game-pairs.controller";
import {Connection} from "mongoose";

const controllers = [
  AuthController,
  QuestionsController,
  PairQuizGamePairsController,
  PairQuizGameUsersController,
  TestingController,
  UsersController,
];

const services = [
  AuthService,
  EmailAdapters,
  EmailManager,
  JwtService,
  QuestionsService,
  NestJwtService,
  PairQuizGameService,
  SecurityService,
  UsersService,
];

const validators = [
  ConfirmationCodeValidator,
  EmailExistValidator,
  EmailResendingValidator,
  LoginExistValidator,
  PasswordRecoveryValidator,
];

const useCases = [CreateUserUseCase, CreateUserBySaUseCase];

const repositories = [
  {
    provide: IUserBanInfoRepository,
    useClass: repositorySwitcher(
      settings.currentRepository,
      repositoryName.BanInfoRepository,
    ),
  },
  {
    provide: IEmailConfirmationRepository,
    useClass: repositorySwitcher(
      settings.currentRepository,
      repositoryName.EmailConfirmation,
    ),
  },
  {
    provide: IQuestionsRepository,
    useClass: repositorySwitcher(
      settings.repositoryType.mongoose,
      repositoryName.QuestionsRepository,
    ),
  },
  {
    provide: IQuestionsQueryRepository,
    useClass: repositorySwitcher(
      settings.repositoryType.mongoose,
      repositoryName.QuestionsQueryRepository,
    ),
  },
  {
    provide: IQuizGameRepository,
    useClass: repositorySwitcher(
      settings.currentRepository,
      repositoryName.GameRepository,
    ),
  },
  {
    provide: IJwtRepository,
    useClass: repositorySwitcher(
      settings.currentRepository,
      repositoryName.Jwt,
    ),
  },
  {
    provide: IQuizGameRepository,
    useClass: repositorySwitcher(
      settings.currentRepository,
      repositoryName.GameRepository,
    ),
  },
  {
    provide: IQuizGameQueryRepository,
    useClass: repositorySwitcher(
      settings.currentRepository,
      repositoryName.GameQueryRepository,
    ),
  },
  {
    provide: ITestingRepository,
    useClass: repositorySwitcher(
      settings.repositoryType.mongoose,
      repositoryName.TestingRepository,
    ),
  },
  {
    provide: ISecurityRepository,
    useClass: repositorySwitcher(
      settings.currentRepository,
      repositoryName.SecurityRepository,
    ),
  },
  {
    provide: ISecurityQueryRepository,
    useClass: repositorySwitcher(
      settings.currentRepository,
      repositoryName.SecurityQueryRepository,
    ),
  },
  {
    provide: IUsersRepository,
    useClass: repositorySwitcher(
      settings.repositoryType.mongoose,
      repositoryName.UsersRepository,
    ),
  },
  {
    provide: IUsersQueryRepository,
    useClass: repositorySwitcher(
      settings.repositoryType.mongoose,
      repositoryName.UsersQueryRepository,
    ),
  },
];

export const entity = [
  SqlCredentials,
  SqlEmailConfirmation,
  SqlGame,
  SqlGameQuestions,
  SqlGameProgress,
  SqlQuestions,
  SqlSecurity,
  SqlTokenBlackList,
  SqlUserAnswer,
  SqlUserBanInfo,
  SqlUsers,
];

export const mongooseModels = [
  { name: MongoAnswers.name, schema: AnswerSchema },
  { name: MongoQuestion.name, schema: QuestionSchema },
  { name: MongoCredentials.name, schema: CredentialSchema },
  { name: MongoUserBanInfo.name, schema: UserBanInfoSchema },
  { name: MongoUsers.name, schema: UserSchema },
];

@Module({
  imports: [
    ConfigModule.forRoot(),
    ...configSwitcher(settings.currentRepository),
  ],
  controllers: [...controllers],
  providers: [
    Connection,
    ...repositories,
    ...services,
    ...validators,
    ...useCases,
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: LoggingInterceptor
    // }
  ],
})
export class AppModule {}
