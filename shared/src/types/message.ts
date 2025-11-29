import { z } from 'zod';
import { DEFAULT_ROOM, MAX_MESSAGE_LENGTH, MAX_NICKNAME_LENGTH } from '../constants';
import { serializedTimestampsSchema, timestampsSchema } from '../utils/timestamp';

export const messageSchema = z
  .object({
    id: z.uuid(),
    type: z.literal('user'),
    content: z.string().min(1).max(MAX_MESSAGE_LENGTH),
    senderNick: z.string().min(1).max(MAX_NICKNAME_LENGTH),
    roomId: z.string().default(DEFAULT_ROOM),
    isGlobal: z.boolean().default(false),
  })
  .extend(timestampsSchema.shape);

export const serializedMessageSchema = messageSchema.extend(serializedTimestampsSchema.shape);

export const systemMessageSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('system'),
  content: z.string().min(1),
  roomId: z.string(),
  createdAt: z.string().datetime(),
});

export const anySerializedMessageSchema = z.discriminatedUnion('type', [
  serializedMessageSchema,
  systemMessageSchema,
]);

export const sendMessageDtoSchema = serializedMessageSchema
  .omit({ id: true, type: true, createdAt: true, updatedAt: true })
  .strict();

export const updateMessageDtoSchema = sendMessageDtoSchema.partial();

export type Message = z.output<typeof messageSchema>;
export type SerializedMessage = z.output<typeof serializedMessageSchema>;
export type SystemMessage = z.output<typeof systemMessageSchema>;
export type AnySerializedMessage = z.output<typeof anySerializedMessageSchema>;
export type SendMessageDto = z.input<typeof sendMessageDtoSchema>;
export type UpdateMessageDto = z.input<typeof updateMessageDtoSchema>;
