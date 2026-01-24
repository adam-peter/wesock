# CLAUDE.md

This file provides guidance to Claude Code when working with the Wesock real-time chat application.

## Project Overview

Wesock is a real-time chat application built with WebSockets, featuring ephemeral users and auto-expiring messages. This is a monorepo containing a decoupled backend and frontend with a shared type library.

## Tech Stack

- **TypeScript**: Full TypeScript codebase (backend, frontend, shared)
- **Backend**: Express.js + Socket.io + Drizzle ORM + PostgreSQL
- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Validation**: Zod for schema definitions and runtime validation
- **Package manager**: Bun for installing packages / running commands

## Architecture

```
wesock/
├── backend/          # Express + Socket.io server (independently deployable)
├── frontend/         # Vite React TypeScript application
└── shared/           # Zod schemas, types, and shared utilities
    ├── types/      # Zod schema & type definitions
    └── utils/        # Shared helper functions
```

**Key Principles:**
- Don't include any comments ever, unless they're commenting on an extremely complex piece of logic that's not clear from reading the code.
- Backend and frontend are completely decoupled (separate deployments)
  -> Never install anything / put code in the monorepo root, only in frontend / backend / shared directories themselves
- Shared directory is the single source of truth for types
- All cross-boundary data uses Zod schemas for validation
- No circular dependencies between packages

---

## Code Style & Conventions

### TypeScript Configuration
- `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitReturns: true`
- Explicit function return types required (ESLint enforced)

### Naming Conventions

**Functions:**
- Handlers: `handlerMessageSend`, `handlerJoinRoom` (prefix pattern)
- Middleware: `middlewareAuth`, `middlewareErrors` (prefix pattern)
- Socket event handlers: `handleChatMessage`, `handleDisconnect`

**Files:**
- Schemas: `{entity}.schema.ts` (e.g., `message.schema.ts`)
- Types: `{entity}.types.ts`
- Handlers: `{action}.handler.ts`
- Routes: `{entity}.router.ts`
- Socket handlers: `{event}.socket.ts`
- Database queries: `{entity}.queries.ts`

**Types & Schemas:**
- Schemas: `messageSchema`, `serializedMessageSchema`
- Types: `Message`, `SerializedMessage` (PascalCase)
- DTOs: `SendMessageDto`, `CreateMessageDto`
- Constants: `MAX_MESSAGE_LENGTH`, `DEFAULT_ROOM` (UPPER_SNAKE_CASE)

---

## Zod Schema Pattern (Critical)

**Pattern: Base → Serialized → DTO → Types**

```typescript
// shared/types/message.ts

// 1. Base schema (database representation)
export const messageSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1).max(MAX_MESSAGE_LENGTH),
  senderNick: z.string().min(1).max(50),
  roomId: z.string().default('global'),
  createdAt: z.date(),
});

// 2. Serialized schema (API/WebSocket representation)
export const serializedMessageSchema = messageSchema.extend({
  createdAt: z.string().datetime(), // Date → ISO string
});

// 3. DTO schemas (input validation)
export const sendMessageDtoSchema = serializedMessageSchema
  .omit({ id: true, createdAt: true })
  .strict();

// 4. Type definitions
export type Message = z.output<typeof messageSchema>;
export type SerializedMessage = z.output<typeof serializedMessageSchema>;
export type SendMessageDto = z.input<typeof sendMessageDtoSchema>;
```

**Type Inference Rules:**
- **`z.output<>`**: Use for validated data types (what you get after parsing)
- **`z.input<>`**: Use for DTO types (what you accept before validation)
- **Never use `z.infer`**: Always use `z.output` or `z.input` for clarity

**Schema Composition:**
- `.merge()` for mixins
- `.extend()` for modifications
- `.omit()` + `.extend()` for replacements
- `.partial()` for updates
- `.pick()` for projections
- Always use `.strict()` on DTO schemas
- Always use `.trim()` on string inputs

---

## Express Backend Patterns

### Main Entry Point

```typescript
// backend/src/index.ts
const app = express();
const server = createServer(app);  // NOT app.listen()
const io = new Server(server, { connectionStateRecovery: {}, cors: { origin: config.frontendUrl } });

// 1. Body parsing
app.use(express.json());

// 2. Routes
app.use('/health', healthRouter);
app.use('/api/messages', messagesRouter);

// 3. Error handling (MUST be last)
app.use(middlewareErrors);

// 4. Socket.io setup
setupSocketHandlers(io);

// 5. Start server
server.listen(config.port);
```

**Critical Rules:**
- Use `createServer(app)`, NOT `app.listen()` (Socket.io requires HTTP server)
- Error middleware MUST be registered last
- Attach Socket.io to HTTP server, not Express app

### Handler Pattern

```typescript
export async function handlerGetMessages(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const messages = await getMessages();
    res.status(200).json({ messages });
  } catch (err) {
    next(err); // Pass to centralized error handler
  }
}
```

**Rules:**
- Always return `Promise<void>`
- Wrap in try-catch, call `next(err)` on errors
- NEVER return values - use `res.json()` or `res.send()`

---

## Socket.io Patterns

### Event Handler Pattern

```typescript
export async function handleSendMessage(
  io: SocketServer,
  socket: Socket,
  data: unknown,
  callback?: (error?: string) => void
): Promise<void> {
  try {
    // 1. Validate input
    const dto = sendMessageDtoSchema.parse(data);

    // 2. Business logic
    const message = await saveMessage(dto);

    // 3. Broadcast to room
    io.to(dto.room).emit('receive_message', message);

    // 4. Acknowledge
    callback?.();
  } catch (err) {
    console.error('Error:', err);
    callback?.(err instanceof Error ? err.message : 'Unknown error');
  }
}
```

**Broadcast Patterns:**
- `io.emit()` → All connected clients
- `io.to(room).emit()` → All clients in room
- `socket.emit()` → Only this client
- `socket.to(room).emit()` → All in room except sender

**Handler Rules:**
1. Always validate incoming data with Zod schemas
2. Use callback for acknowledgments (success/error)
3. Handle errors gracefully - never let socket handlers crash
4. Use async/await for database operations

---

## Drizzle ORM Patterns

### Schema Definition

```typescript
// backend/src/db/schema.ts
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: text('content').notNull(),
  senderNick: text('sender_nick').notNull(),
  roomId: text('room_id').notNull().default('global'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

### Query Abstraction

```typescript
// backend/src/db/queries/messages.queries.ts
export async function saveMessage(data: { content: string; senderNick: string; roomId: string }): Promise<Message> {
  const [row] = await db.insert(messages).values(data).returning();
  return { id: row.id, content: row.content, senderNick: row.senderNick, roomId: row.roomId, createdAt: row.createdAt };
}
```

**Rules:**
- Isolate all database logic in query modules
- Return domain types (from `shared/types`), not raw rows
- Handle "not found" by returning `undefined`, not throwing

---

## Error Handling

### Centralized Error Middleware

```typescript
// backend/src/middleware/errors.ts
export function middlewareErrors(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validation failed', details: err.errors });
    return;
  }
  if (err instanceof BadRequestError) {
    res.status(400).json({ error: err.message });
    return;
  }
  res.status(500).json({ error: 'Internal server error' });
}
```

---

## Key Architecture Principles

1. **Single Source of Truth**: All types derived from Zod schemas in `shared/`
2. **Validation Everywhere**: Validate at boundaries (API, WebSocket, DB)
3. **Explicit Over Implicit**: Explicit return types, explicit error handling
4. **Separation of Concerns**: Routers, handlers, queries, socket handlers all separate
5. **Type Safety**: Leverage TypeScript strict mode and Zod for runtime safety
6. **Error Handling**: Centralized error middleware, never crash socket handlers

---

## MVP Notes

- **No user authentication, no user table in DB** - users are ephemeral
- **Track users in-memory** with `socket.id` as identifier
- **Messages auto-delete after 24 hours** (cleanup job with `setInterval`)
- **Default room**: All users start in "global" room
- **Stretch Goals**: Custom rooms, user accounts (see `.claude/specs/00_plan.md`)
