import {MongooseModule} from '@nestjs/mongoose';
import {MongooseConfig} from './mongoose.config';
import {entity, mongooseModels} from '../app.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {TypeOrmConfig} from './type-orm.config';
import {settings} from '../settings';

export const configSwitcher = (repositoryType: string) => {
  if (repositoryType === settings.repositoryType.mongoose) {
    return [
      MongooseModule.forRootAsync({
        useClass: MongooseConfig,
      }),
      MongooseModule.forFeature([...mongooseModels]),
    ];
  }

  return [
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfig,
    }),
    TypeOrmModule.forFeature([...entity]),
  ];
};
