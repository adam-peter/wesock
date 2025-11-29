import type { MigrationConfig } from 'drizzle-orm/migrator';
import { envOrThrow } from 'shared';

export type Platform = 'dev' | 'prod'

interface DBConfig {
  url: string;
  migrationConfig: MigrationConfig;
}

interface APIConfig {
  platform: Platform;
  db: DBConfig;
}

export const config: APIConfig = {
  platform: envOrThrow('PLATFORM') as Platform,
  db: {
    url: envOrThrow('DATABASE_URL'),
    migrationConfig: {
      migrationsFolder: './src/db/migrations',
    },
  },
};
