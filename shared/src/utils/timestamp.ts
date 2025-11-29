import { z } from 'zod';

export const timestampsSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const serializedTimestampsSchema = z.object({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Timestamps = z.output<typeof timestampsSchema>;
export type SerializedTimestamps = z.output<typeof serializedTimestampsSchema>;
