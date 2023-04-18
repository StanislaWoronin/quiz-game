import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { DataSource } from 'typeorm';
import { SqlCredentials } from '../../modules/sa/users/infrastructure/sql/entity/credentials.entity';
import { SqlEmailConfirmation } from '../../modules/sa/users/infrastructure/sql/entity/sql-email-confirmation.entity';
import { SqlGame } from '../../modules/public/pair-quiz-game/infrastructure/sql/entity/sql-game.entity';
import { SqlGameQuestions } from '../../modules/public/pair-quiz-game/infrastructure/sql/entity/sql-game-questions.entity';
import { SqlGameProgress } from '../../modules/public/pair-quiz-game/infrastructure/sql/entity/sql-game-progress.entity';
import { SqlQuestions } from '../../modules/sa/questions/infrastructure/sql/entity/questions.entity';
import { SqlSecurity } from '../../modules/public/security/infrastructure/sql/entity/security';
import { SqlTokenBlackList } from '../../modules/public/auth/infrastructure/sql/entity/sql-token-black-list.entity';
import { SqlUserAnswer } from '../../modules/public/pair-quiz-game/infrastructure/sql/entity/sql-user-answer.entity';
import { SqlUserBanInfo } from '../../modules/sa/users/infrastructure/sql/entity/ban-info.entity';
import { SqlUsers } from '../../modules/sa/users/infrastructure/sql/entity/users.entity';

// export const typeOrmConfig: PostgresConnectionOptions = {
//   type: 'postgres',
//   url: process.env.ENV_TYPE === 'local' ? process.env.POSTGRES_LOCAL_URI : process.env.POSTGRES_URI,
//   synchronize: false,
//   migrations: [__dirname + '/migrations-files/**/*{.ts,.js}'],
//   entities: entity
// }

export const typeOrmConfig: PostgresConnectionOptions = {
  //logging: ['error', 'info', 'query'],
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'admin',
  database: 'quiz_game',
  synchronize: true,
  migrations: [__dirname + '/migrations-files/**/*{.ts,.js}'],
  entities: [
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
  ],
};

export default new DataSource(typeOrmConfig);
