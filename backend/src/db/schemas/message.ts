import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { DEFAULT_ROOM } from 'shared';

const timestamps = {
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  content: text('content').notNull(),
  senderNick: text('sender_nick').notNull(),
  roomId: text('room_id').notNull().default(DEFAULT_ROOM),
  ...timestamps,
});
