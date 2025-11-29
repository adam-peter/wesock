import { z } from 'zod';
import { DEFAULT_ROOM, MAX_NICKNAME_LENGTH } from '../constants';

export const onlineUserSchema = z.object({
  id: z.string(),
  nick: z.string().min(1).max(MAX_NICKNAME_LENGTH),
  roomId: z.string().default(DEFAULT_ROOM),
});

export const joinRoomDtoSchema = z
  .object({
    nick: z.string().min(1).max(MAX_NICKNAME_LENGTH).trim(),
    roomId: z.string().default(DEFAULT_ROOM),
  })
  .strict();

export const userListUpdateSchema = z.object({
  users: z.array(onlineUserSchema),
});

export type OnlineUser = z.output<typeof onlineUserSchema>;
export type JoinRoomDto = z.input<typeof joinRoomDtoSchema>;
export type UserListUpdate = z.output<typeof userListUpdateSchema>;
