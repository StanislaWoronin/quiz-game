import {PostgresConnectionOptions} from "typeorm/driver/postgres/PostgresConnectionOptions";
import {entity} from "../../app.module";
import {DataSource} from "typeorm";

// export const typeOrmConfig: PostgresConnectionOptions = {
//   type: 'postgres',
//   url: process.env.ENV_TYPE === 'local' ? process.env.POSTGRES_LOCAL_URI : process.env.POSTGRES_URI,
//   synchronize: false,
//   migrations: [__dirname + '/migrations-files/**/*{.ts,.js}'],
//   entities: entity
// }


export const typeOrmConfig: PostgresConnectionOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'admin',
  database: 'quiz_game',
  synchronize: false,
  migrations: [__dirname + '/migrations-files/**/*{.ts,.js}'],
  entities: entity
}


export default new DataSource(typeOrmConfig)
