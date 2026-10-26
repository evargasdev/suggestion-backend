import { Module } from '@nestjs/common';
import { databaseProvider } from './postgres.provider';

@Module({
  imports: [databaseProvider],
  exports: [databaseProvider],
})
export class DatasourceModule {}
