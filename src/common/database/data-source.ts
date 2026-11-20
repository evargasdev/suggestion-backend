import { config as dotenvConfig } from 'dotenv';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { databaseValidationSchema } from '../config/database';

dotenvConfig({ path: '.env' });
const { value: envs, error } = databaseValidationSchema.validate(process.env, {
  allowUnknown: true,
});
if (error) {
  throw Error(`Config validation error: ${error.message}`);
}

const entitiesDir = join(
  __dirname,
  '..',
  '..',
  '**',
  '**',
  'entities',
  '*.entity{.ts,.js}',
);
const migrationsDir = join(__dirname, 'migrations', '*{.ts,.js}');

const options: DataSourceOptions = {
  type: 'postgres',
  ...(envs.DATABASE_URL
    ? { url: envs.DATABASE_URL }
    : {
        host: envs.PG_HOST,
        port: envs.PG_PORT,
        username: envs.PG_USERNAME,
        password: envs.PG_PASSWORD,
        database: envs.PG_DATABASE,
      }),
  entities: [entitiesDir],
  migrations: [migrationsDir],
  synchronize: false,
};

export const dataSource = new DataSource(options);
