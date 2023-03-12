import { repositories } from "./repositories";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseConfig } from "../../config/mongoose.config";
import { entity, mongooseModels } from "../../app.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmConfig } from "../../config/type-orm.config";
import { settings } from "../../settings";

export const configSwitcher = (
  repositoryType: string,
) => {
  if (repositoryType === settings.repositoryType.mongoose) {
    return [
      MongooseModule.forRootAsync({ imports: [ConfigModule], useClass: MongooseConfig, inject: [ConfigService] }),
      MongooseModule.forFeature([...mongooseModels])
    ]
  }
  return [
    TypeOrmModule.forRootAsync({ imports: [ConfigModule], useClass: TypeOrmConfig, extraProviders: [ConfigService]} ),
    TypeOrmModule.forFeature([ ...entity ])
  ]
}