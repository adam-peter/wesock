import { desc, lt, eq } from 'drizzle-orm';
import { db } from '..';
import { messages } from '../schemas/message';
import { MESSAGE_HISTORY_LIMIT, messageSchema, type Message } from 'shared';

export async function createMessage(
  content: string,
  senderNick: string,
  roomId: string,
  isGlobal: boolean
): Promise<Message> {
  const [result] = await db
    .insert(messages)
    .values({
      content,
      senderNick,
      roomId,
      isGlobal,
    })
    .returning();

  return messageSchema.parse(result);
}

export async function getMessages(roomId: string, limit: number = MESSAGE_HISTORY_LIMIT): Promise<Message[]> {
  const result = await db
    .select()
    .from(messages)
    .where(eq(messages.roomId, roomId))
    .orderBy(desc(messages.createdAt))
    .limit(limit);

  return messageSchema.array().parse(result);
}

export async function deleteOldMessages(olderThan: Date): Promise<void> {
  await db
    .delete(messages)
    .where(lt(messages.createdAt, olderThan));
}
