import { databaseValidationSchema } from './database';
import { generalValidationSchema } from './general';

export const validationSchema = generalValidationSchema
  .concat(databaseValidationSchema)
