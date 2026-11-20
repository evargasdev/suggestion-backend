import { databaseValidationSchema } from './database';

describe('databaseValidationSchema', () => {
  it('accepts a Neon URL without individual PostgreSQL variables', () => {
    const result = databaseValidationSchema.validate({
      DATABASE_URL:
        'postgresql://test:test@ep-example.neon.tech/app?sslmode=require',
    });

    expect(result.error).toBeUndefined();
  });

  it('accepts a Neon URL alongside empty Docker PostgreSQL variables', () => {
    const result = databaseValidationSchema.validate({
      DATABASE_URL:
        'postgresql://test:test@ep-example.neon.tech/app?sslmode=require',
      PG_HOST: '',
      PG_PORT: '',
      PG_USERNAME: '',
      PG_PASSWORD: '',
      PG_DATABASE: '',
    });

    expect(result.error).toBeUndefined();
  });

  it('continues to accept the complete local PostgreSQL configuration', () => {
    const result = databaseValidationSchema.validate({
      PG_HOST: 'localhost',
      PG_PORT: '5432',
      PG_USERNAME: 'suggestion',
      PG_PASSWORD: 'suggestion',
      PG_DATABASE: 'suggestion',
    });

    expect(result.error).toBeUndefined();
  });

  it('rejects an incomplete local PostgreSQL configuration', () => {
    const result = databaseValidationSchema.validate({
      PG_HOST: 'localhost',
    });

    expect(result.error).toBeDefined();
  });
});
