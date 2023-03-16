import { Injectable } from '@nestjs/common';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MongooseConfig implements MongooseOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  private getUrl(): string {
    const env = this.configService.get('ENV_TYPE');
    switch (env) {
      case 'local':
        return this.configService.get('MONGO_LOCAL_URI');
      case 'dev':
        return this.configService.get('MONGO_URI');
      default:
        return this.configService.get('MONGO_URI');
    }
  }

  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: this.getUrl(),
    };
  }
}
