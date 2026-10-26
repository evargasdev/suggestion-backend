import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { databaseConfig, DatabaseVariables } from '../config/database';

export const databaseProvider = TypeOrmModule.forRootAsync({
  imports: [ConfigModule.forFeature(databaseConfig)],
  inject: [databaseConfig.KEY],
  useFactory: (config: DatabaseVariables) => {
    const dirEntities = join(
      __dirname,
      '/../../**/**/entities/*.entity{.ts,.js}',
    );

    return {
      synchronize: false,
      type: 'postgres',
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      database: config.database,
      entities: [dirEntities],
    };
  },
});
