import { ConfigType, registerAs } from '@nestjs/config';
import * as Joi from 'joi';

const pgVariablesSchema = Joi.object({
  PG_HOST: Joi.string().required(),
  PG_PORT: Joi.number().port().required(),
  PG_USERNAME: Joi.string().required(),
  PG_PASSWORD: Joi.string().required(),
  PG_DATABASE: Joi.string().required(),
}).unknown(true);

export const databaseValidationSchema = Joi.object({
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgres', 'postgresql'] })
    .allow('')
    .optional(),
  PG_HOST: Joi.string().empty(''),
  PG_PORT: Joi.number().port().empty(''),
  PG_USERNAME: Joi.string().empty(''),
  PG_PASSWORD: Joi.string().empty(''),
  PG_DATABASE: Joi.string().empty(''),
})
  .custom((values, helpers) => {
    if (values.DATABASE_URL) return values;

    const { error } = pgVariablesSchema.validate(values);
    return error
      ? helpers.error('any.custom', { message: error.message })
      : values;
  })
  .messages({ 'any.custom': '{{#message}}' });

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL || undefined,
  host: process.env.PG_HOST,
  port: process.env.PG_PORT ? Number(process.env.PG_PORT) : undefined,
  username: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
}));

export type DatabaseVariables = ConfigType<typeof databaseConfig>;
