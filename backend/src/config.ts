import type { MigrationConfig } from 'drizzle-orm/migrator';
import { type Platform } from 'shared';
import { envOrThrow } from './utils/envOrThrow';

interface DBConfig {
  url: string;
  migrationConfig: MigrationConfig;
}

interface APIConfig {
  platform: Platform;
  db: DBConfig;
  allowedOrigins: string[];
}

export const config: APIConfig = {
  platform: envOrThrow('PLATFORM') as Platform,
  db: {
    url: envOrThrow('DATABASE_URL'),
    migrationConfig: {
      migrationsFolder: './src/db/migrations',
    },
  },
  allowedOrigins: envOrThrow('ALLOWED_ORIGINS').split(',').map(origin => origin.trim()),
};
