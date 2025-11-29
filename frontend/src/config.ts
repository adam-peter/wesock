import { envOrThrow, type Platform } from 'shared';

interface AppConfig {
  apiBaseUrl: string;
  platform: Platform;
}

export const config: AppConfig = {
  apiBaseUrl: envOrThrow('VITE_API_BASE_URL'),
  platform: envOrThrow('VITE_PLATFORM') as Platform,
};
