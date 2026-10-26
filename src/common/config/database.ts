import { ConfigType, registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const databaseValidationSchema = Joi.object({
  PG_HOST: Joi.string().required(),
  PG_PORT: Joi.number().required(),
  PG_USERNAME: Joi.string().required(),
  PG_PASSWORD: Joi.string().required(),
  PG_DATABASE: Joi.string().required(),
});

export const databaseConfig = registerAs('database', () => ({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  username: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
}));

export type DatabaseVariables = ConfigType<typeof databaseConfig>;
