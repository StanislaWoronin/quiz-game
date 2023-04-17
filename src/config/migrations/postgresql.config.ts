import {PostgresConnectionOptions} from "typeorm/driver/postgres/PostgresConnectionOptions";
import {entity} from "../../app.module";
import {DataSource} from "typeorm";

export const typeOrmConfig: PostgresConnectionOptions = {
    type: 'postgres',
    url: process.env.ENV_TYPE === 'local' ? process.env.POSTGRES_LOCAL_URI : process.env.POSTGRES_URI,
    synchronize: true,
    ssl: process.env.ENV_TYPE !== 'local',
    migrations: [__dirname + '/**/*{.ts, .js}'],
    entities: entity
}


export default new DataSource(typeOrmConfig)