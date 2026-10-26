import { config as dotenvConfig } from 'dotenv';
import * as joi from 'joi';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

export const validationSchema = joi
  .object({
    PG_HOST: joi.string().required(),
    PG_PORT: joi.string().required(),
    PG_USERNAME: joi.string().required(),
    PG_PASSWORD: joi.string().required(),
    PG_DATABASE: joi.string().required(),
  })
  .unknown(true);

const dotenv = dotenvConfig({ path: '.env' });
if (dotenv?.error) {
  throw Error('No .env file found');
}
const { value: envs, error } = validationSchema.validate(dotenv.parsed);
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
  host: `${envs.PG_HOST}`,
  port: parseInt(`${envs.PG_PORT}`),
  username: `${envs.PG_USERNAME}`,
  password: `${envs.PG_PASSWORD}`,
  database: `${envs.PG_DATABASE}`,
  entities: [entitiesDir],
  migrations: [migrationsDir],
  synchronize: false,
};

export const dataSource = new DataSource(options);
