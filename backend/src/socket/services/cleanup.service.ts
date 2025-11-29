import { deleteOldMessages } from '../../db/queries/messages';
import { MESSAGE_TTL_HOURS } from 'shared';

export async function cleanupOldMessages(): Promise<void> {
  const cutoffDate = new Date(Date.now() - MESSAGE_TTL_HOURS * 60 * 60 * 1000);
  await deleteOldMessages(cutoffDate);
  console.log(`Cleaned up messages older than ${MESSAGE_TTL_HOURS} hours`);
}

export function startCleanupInterval(): NodeJS.Timeout {
  const intervalMs = 1000 * 60 * 60;
  return setInterval(() => {
    void cleanupOldMessages();
  }, intervalMs);
}
