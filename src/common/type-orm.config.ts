import { Injectable } from "@nestjs/common";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class TypeOrmConfig implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {
  }

  private getUrl(): string {
    const env = this.configService.get('ENV_TYPE')
    switch (env) {
      case 'local':
        return this.configService.get('POSTGRES_LOCAL_URI')
      case 'dev':
        return this.configService.get('POSTGRES_URI')
      default:
        return this.configService.get('POSTGRES_URI')
    }
  }

  private getSsl(): boolean {
    const env = this.configService.get('ENV_TYPE')
    switch (env) {
      case 'local':
        return false
      case 'dev':
        return true
      default:
        return true
    }
  }

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      url: this.getUrl(),
      autoLoadEntities: true,
      synchronize: true,
      ssl: this.getSsl()
    }
  }
}