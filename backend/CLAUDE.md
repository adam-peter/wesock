# Backend - Wesock

Express.js + Socket.io + Drizzle ORM backend. Package manager: **Bun**.
- Don't include any comments ever, unless they're commenting on an extremely complex piece of logic that's not clear from reading the code.

## Critical Setup Rule

```typescript
const app = express();
const server = createServer(app);  // NOT app.listen()
const io = new Server(server, { cors: { origin: config.frontendUrl } });

app.use(express.json());
app.use('/api/messages', messagesRouter);
app.use(middlewareErrors);  // MUST be last

setupSocketHandlers(io);
server.listen(config.port);  // Use server, not app
```

**Why:** Socket.io requires HTTP server, not Express app.

## Naming Conventions

**Handlers**: `handlerGetMessages` | **Middleware**: `middlewareAuth`, `middlewareErrors` | **Socket**: `handleJoinRoom` | **Files**: `{entity}.router.ts`, `{entity}.queries.ts` | **Constants**: `UPPER_SNAKE_CASE`

## Express Handler Pattern

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
    next(err);
  }
}
```

**Rules:**
- Return `Promise<void>`, call `next(err)` on errors
- NEVER return values - use `res.json()` or `res.send()`
- Error middleware MUST be last

## Socket.io Event Handler Pattern

```typescript
export async function handleSendMessage(
  io: SocketServer,
  socket: Socket,
  data: unknown,
  callback?: (error?: string) => void
): Promise<void> {
  try {
    const dto = sendMessageDtoSchema.parse(data);
    const message = await saveMessage(dto);
    io.to(dto.room).emit('receive_message', message);
    callback?.();
  } catch (err) {
    callback?.(err instanceof Error ? err.message : 'Unknown error');
  }
}
```

**Broadcast patterns:**
- `io.emit()` → All clients
- `io.to(room).emit()` → All in room
- `socket.emit()` → Only this client
- `socket.to(room).emit()` → All in room except sender

**Rules:**
1. Always validate with Zod schemas from `shared`
2. Use callback for acknowledgments
3. Never crash - handle all errors
4. Use async/await for database ops

## Drizzle ORM Patterns

**Schema:**
```typescript
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: text('content').notNull(),
  senderNick: text('sender_nick').notNull(),
  roomId: text('room_id').notNull().default('global'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

**Query abstraction:**
```typescript
export async function saveMessage(
  data: { content: string; senderNick: string; roomId: string }
): Promise<Message> {
  const [row] = await db.insert(messages).values(data).returning();
  return { id: row.id, content: row.content, senderNick: row.senderNick,
           roomId: row.roomId, createdAt: row.createdAt };
}
```

**Rules:**
- Isolate DB logic in `db/queries/` modules
- Return domain types from `shared/types`, not raw rows
- Return `undefined` for "not found", don't throw

## Error Handling

```typescript
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

## Configuration

```typescript
function envOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing: ${key}`);
  return value;
}

export const config = {
  port: parseInt(envOrThrow('PORT'), 10),
  frontendUrl: envOrThrow('FRONTEND_URL'),
  db: { url: envOrThrow('DATABASE_URL') },
};
```

## Scripts

`bun dev` | `bun run build` | `bun run db:generate` | `bun run db:migrate`

## MVP Notes

No auth - ephemeral users (in-memory, `socket.id` identifier). Messages auto-delete after 24h. Default room: "global".
