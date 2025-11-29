import { desc, lt } from 'drizzle-orm';
import { db } from '..';
import { type Message, messages } from '../schema';
import { MESSAGE_HISTORY_LIMIT } from 'shared';

export async function createMessage(
  content: string,
  senderNick: string,
  roomId: string
): Promise<Message> {
  const [result] = await db
    .insert(messages)
    .values({
      content,
      senderNick,
      roomId,
    })
    .returning();
  return result;
}

export async function getMessages(limit: number = MESSAGE_HISTORY_LIMIT): Promise<Message[]> {
  return await db
    .select()
    .from(messages)
    .orderBy(desc(messages.createdAt))
    .limit(limit);
}

export async function deleteOldMessages(olderThan: Date): Promise<void> {
  await db
    .delete(messages)
    .where(lt(messages.createdAt, olderThan));
}
