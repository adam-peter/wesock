import { type Platform } from 'shared';
import { envOrThrow } from './utils/envOrThrow';

interface AppConfig {
  apiBaseUrl: string;
  platform: Platform;
}

export const config: AppConfig = {
  apiBaseUrl: envOrThrow('VITE_API_BASE_URL'),
  platform: envOrThrow('VITE_PLATFORM') as Platform,
};
