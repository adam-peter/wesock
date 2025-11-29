import { createMessage, getMessages } from '../../db/queries/messages';
import { type Message, type SerializedMessage, MESSAGE_HISTORY_LIMIT } from 'shared';

export async function saveMessage(
  content: string,
  senderNick: string,
  roomId: string
): Promise<Message> {
  return await createMessage(content, senderNick, roomId);
}

export async function loadMessageHistory(
  limit: number = MESSAGE_HISTORY_LIMIT
): Promise<Message[]> {
  return await getMessages(limit);
}

export function serializeMessage(message: Message): SerializedMessage {
  return {
    id: message.id,
    content: message.content,
    senderNick: message.senderNick,
    roomId: message.roomId,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
  };
}

export function serializeMessages(messages: Message[]): SerializedMessage[] {
  return messages.map(serializeMessage);
}
