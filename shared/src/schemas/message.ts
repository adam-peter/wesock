import { z } from 'zod';
import { DEFAULT_ROOM, MAX_MESSAGE_LENGTH, MAX_NICKNAME_LENGTH } from '../constants';
import { serializedTimestampsSchema, timestampsSchema } from '../utils/timestamp';

export const messageSchema = z
  .object({
    id: z.uuid(),
    content: z.string().min(1).max(MAX_MESSAGE_LENGTH),
    senderNick: z.string().min(1).max(MAX_NICKNAME_LENGTH),
    roomId: z.string().default(DEFAULT_ROOM),
  })
  .merge(timestampsSchema);

export const serializedMessageSchema = messageSchema.extend(serializedTimestampsSchema);

export const sendMessageDtoSchema = serializedMessageSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .strict();

export const updateMessageDtoSchema = sendMessageDtoSchema.partial();

export type Message = z.output<typeof messageSchema>;
export type SerializedMessage = z.output<typeof serializedMessageSchema>;
export type SendMessageDto = z.input<typeof sendMessageDtoSchema>;
export type UpdateMessageDto = z.input<typeof updateMessageDtoSchema>;
