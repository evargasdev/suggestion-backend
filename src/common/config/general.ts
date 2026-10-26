import { ConfigType, registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export const generalValidationSchema = Joi.object({
});

export const generalConfig = registerAs('general', () => ({
}));

export type GeneralVariables = ConfigType<typeof generalConfig>;
