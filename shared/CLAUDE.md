# Shared - Wesock Type Library

Zod schemas and TypeScript types. Single source of truth for all types across backend/frontend.
- Don't include any comments ever, unless they're commenting on an extremely complex piece of logic that's not clear from reading the code.

## Schema Definition Pattern

**Critical: Base → Serialized → Populated → DTO → Types**

```typescript
// types/message.ts
import { z } from 'zod';
import { timestampsSchema, serializedTimestampsSchema } from './timestamps';

export const MAX_MESSAGE_LENGTH = 500;

// 1. Base schema (database - Date objects)
export const messageSchema = z
  .object({
    id: z.uuid(),
    content: z.string().min(1).max(MAX_MESSAGE_LENGTH),
    senderNick: z.string().min(1).max(50),
    roomId: z.string().default('global'),
    senderId: z.uuid().nullish(),
  })
  .extend(timestampsSchema.shape);

// 2. Serialized schema (API/WebSocket - Date → ISO string)
export const serializedMessageSchema = messageSchema.extend(serializedTimestampsSchema.shape);

// 3. Populated schemas (replace refs with full objects)
export const populatedMessageSchema = messageSchema
  .omit({ senderId: true })
  .extend({
    sender: userSchema.nullish(),
  });

export const serializedPopulatedMessageSchema = serializedMessageSchema
  .omit({ senderId: true })
  .extend({
    sender: serializedUserSchema.nullish(),
  });

// 4. DTO schemas (input validation)
export const createMessageDtoSchema = serializedMessageSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .strict();

export const updateMessageDtoSchema = createMessageDtoSchema.partial();

// 5. Types
export type Message = z.output<typeof messageSchema>;
export type SerializedMessage = z.output<typeof serializedMessageSchema>;
export type PopulatedMessage = z.output<typeof populatedMessageSchema>;
export type SerializedPopulatedMessage = z.output<typeof serializedPopulatedMessageSchema>;
export type CreateMessageDto = z.input<typeof createMessageDtoSchema>;
export type UpdateMessageDto = z.input<typeof updateMessageDtoSchema>;
```

**Timestamps pattern:**
```typescript
const timestampsSchema = z.object({ createdAt: z.date(), updatedAt: z.date() });
const serializedTimestampsSchema = z.object({ createdAt: z.string().datetime(), updatedAt: z.string().datetime() });
```

## Type Inference

**NEVER use `z.infer` - always `z.output<>` (validated data) or `z.input<>` (DTO types)**

## Code Style Specificities

**`.nullish()` for nullable:** `senderId: z.string().uuid().nullish()`

**`.merge()` for shared schemas:** `messageSchema = z.object({...}).merge(timestampsSchema)`

**UUID handling:** `id: z.string().uuid()` | `senderId: z.string().uuid().nullish()` (nullable FK)

**Serialization:** Base uses `z.date()`, Serialized uses `z.string().datetime()` (Date → ISO string)

**Populated schemas:** Replace ref IDs with full objects via `.omit()` + `.extend()`

**Update DTOs:** `const updateDto = createDto.partial()`

## Type Guards

**Enums:** `export const isFeature = (value: unknown): value is Feature => Object.values(Feature).some(f => f === value);`

**Schemas:** `export const isMessage = (value: unknown): value is Message => messageSchema.safeParse(value).success;`

## Naming Conventions

**Schemas:**
- Base: `messageSchema`
- Serialized: `serializedMessageSchema`
- Populated: `populatedMessageSchema`, `serializedPopulatedMessageSchema`
- DTOs: `createMessageDtoSchema`, `updateMessageDtoSchema`

**Types:**
- Base: `Message`
- Serialized: `SerializedMessage`
- Populated: `PopulatedMessage`, `SerializedPopulatedMessage`
- DTOs: `CreateMessageDto`, `UpdateMessageDto`

**Constants:** `MAX_MESSAGE_LENGTH` (UPPER_SNAKE_CASE)

## File Organization

1. Imports (external → internal → utils)
2. Constants
3. Base schema (Date objects)
4. Serialized schema (ISO strings)
5. Populated schemas (if needed)
6. DTO schemas
7. Type exports

## Validation

- **`.strict()`** on DTOs | **`.trim()`** on strings | **`.nullish()`** for nullable (not `.optional()`)
- **`.default()`** for defaults | **`.transform()`** for normalization | **`.refine()`** for business logic

## Key Principles

1. **Single source of truth** - All types from Zod schemas
2. **Runtime validation** - Zod = types + validation
3. **No circular deps** - Shared doesn't import backend/frontend
4. **Explicit types** - Use `z.output`/`z.input`, not `z.infer`
5. **Strict DTOs** - Always `.strict()` on inputs
6. **Nullish over optional** - Use `.nullish()` for flexibility
7. **Base uses Date, Serialized uses ISO strings** - For API boundaries
