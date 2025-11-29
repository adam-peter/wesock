import type { MigrationConfig } from 'drizzle-orm/migrator';
import { envOrThrow } from 'shared';

process.loadEnvFile();

interface DBConfig {
  url: string;
  migrationConfig: MigrationConfig;
}

interface APIConfig {
  platform: string;
  db: DBConfig;
}

export const config: APIConfig = {
  platform: envOrThrow('PLATFORM'),
  db: {
    url: envOrThrow('DB_URL'),
    migrationConfig: {
      migrationsFolder: './src/db/migrations',
    },
  },
};
