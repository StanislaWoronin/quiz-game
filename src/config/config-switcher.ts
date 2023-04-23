import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfig } from './mongoose.config';
import { mongooseModels } from '../app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { settings } from '../settings';
import { typeOrmConfig } from './migrations/postgresql.config';

export const configSwitcher = (repositoryType: string) => {
  if (repositoryType === settings.repositoryType.mongoose) {
    return [
      MongooseModule.forRootAsync({
        useClass: MongooseConfig,
      }),
      MongooseModule.forFeature([...mongooseModels]),
    ];
  }

  return [TypeOrmModule.forRoot(typeOrmConfig)];
};
