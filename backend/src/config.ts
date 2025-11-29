import type { MigrationConfig } from 'drizzle-orm/migrator';
import { envOrThrow, type Platform } from 'shared';

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
