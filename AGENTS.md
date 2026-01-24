# AGENTS.md

Guidelines for AI coding agents working on the Wesock real-time chat application.

## Tech Stack

- **Monorepo**: backend/ + frontend/ + shared/ (Bun workspaces)
- **Backend**: Express.js, Socket.io, Drizzle ORM, PostgreSQL
- **Frontend**: Vite, React 19, Tailwind CSS v4, shadcn/ui
- **Validation**: Zod v4 (shared types)
- **Package Manager**: Bun

## Build/Lint/Test Commands

```bash
# Development
bun run dev                    # Start both backend and frontend
bun run dev:backend            # Backend only (port 3000)
bun run dev:frontend           # Frontend only (Vite dev server)

# Linting (all packages)
bun run lint                   # Run ESLint across all packages
bun run lint:fix               # Auto-fix lint errors

# Per-package linting
cd backend && bun run lint
cd frontend && bun run lint
cd shared && bun run lint

# Frontend build
cd frontend && bun run build   # TypeScript check + Vite build

# Database (backend)
cd backend && bun run db:generate   # Generate Drizzle migrations
cd backend && bun run db:migrate    # Run migrations
cd backend && bun run db:studio     # Open Drizzle Studio
```

**Note**: No test framework is currently configured. When adding tests, use Vitest.

## Project Structure

```
wesock/
├── backend/src/
│   ├── index.ts              # Express + Socket.io entry point
│   ├── config.ts             # Environment config
│   ├── db/schemas/           # Drizzle table definitions
│   ├── db/queries/           # Database query functions
│   ├── socket/handlers/      # Socket.io event handlers
│   ├── socket/services/      # Business logic services
│   └── middleware/           # Express middleware
├── frontend/src/
│   ├── components/           # React components
│   ├── components/ui/        # shadcn/ui components
│   ├── hooks/                # Custom React hooks
│   ├── routes/               # Page components
│   └── lib/                  # Utilities (socket client, cn())
└── shared/src/
    ├── types/                # Zod schemas and TypeScript types
    ├── constants/            # Shared constants
    └── utils/                # Shared utilities
```

## Code Style

### General Rules

- **No comments** unless explaining extremely complex logic
- **Never install packages in monorepo root** - only in backend/, frontend/, or shared/
- **Explicit return types required** in backend and shared (ESLint enforced)
- **Type imports**: Use `import type { X }` or `import { type X }` syntax

### TypeScript Configuration

- `strict: true` across all packages
- `noUncheckedIndexedAccess: true` in backend
- Frontend uses path alias: `@/*` → `./src/*`

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Files (handlers) | `{entity}.handler.ts` | `message.handler.ts` |
| Files (services) | `{entity}.service.ts` | `user.service.ts` |
| Files (queries) | `{entity}.ts` in queries/ | `messages.ts` |
| Files (hooks) | `use{Name}.ts` | `useMessages.ts` |
| Files (components) | `{Name}.tsx` (PascalCase) | `ChatLayout.tsx` |
| Functions | camelCase | `handleSendMessage`, `saveMessage` |
| Middleware | `middleware{Purpose}` | `middlewareErrors` |
| Types | PascalCase | `Message`, `SerializedMessage` |
| Schemas | `{entity}Schema` | `messageSchema`, `sendMessageDtoSchema` |
| Constants | UPPER_SNAKE_CASE | `MAX_MESSAGE_LENGTH` |

### Zod Schema Pattern

Always follow: **Base → Serialized → DTO → Types**

```typescript
// 1. Base schema (database)
export const messageSchema = z.object({
  id: z.uuid(),
  content: z.string().min(1).max(MAX_MESSAGE_LENGTH),
  createdAt: z.date(),
});

// 2. Serialized schema (API/WebSocket - dates as ISO strings)
export const serializedMessageSchema = messageSchema.extend({
  createdAt: z.string().datetime(),
});

// 3. DTO schema (input validation)
export const sendMessageDtoSchema = serializedMessageSchema
  .omit({ id: true, createdAt: true })
  .strict();

// 4. Type exports
export type Message = z.output<typeof messageSchema>;
export type SendMessageDto = z.input<typeof sendMessageDtoSchema>;
```

**Rules**:
- Use `z.output<>` for validated data, `z.input<>` for DTOs
- Never use `z.infer` - always explicit `z.output` or `z.input`
- Always use `.strict()` on DTO schemas
- Always use `.trim()` on user string inputs

### Error Handling

**Backend Express handlers**:
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

**Socket.io handlers**:
```typescript
async function handleSendMessage(
  io: TypedServer,
  socket: TypedSocket,
  data: unknown,
  callback?: (error?: string) => void,
): Promise<void> {
  try {
    const dto = sendMessageDtoSchema.parse(data);
    const message = await saveMessage(dto);
    io.to(dto.roomId).emit('receive_message', message);
    callback?.();
  } catch (err) {
    callback?.(err instanceof Error ? err.message : 'Unknown error');
  }
}
```

**Rules**:
- Express: wrap in try-catch, call `next(err)` on errors
- Socket: never throw - always handle errors and use callback
- Centralized error middleware handles ZodError, custom errors, and 500s

### Imports

```typescript
// Type-only imports (preferred)
import type { Request, Response } from 'express';
import { type Server, type Socket } from 'socket.io';

// Shared types always from 'shared'
import type { Message, SendMessageDto } from 'shared';
import { messageSchema, sendMessageDtoSchema } from 'shared';
```

### Frontend Patterns

**Hooks**: Return explicit object with named properties
```typescript
export function useMessages(): {
  messages: SerializedMessage[];
  clearMessages: () => void;
} {
  const [messages, setMessages] = useState<SerializedMessage[]>([]);
  return { messages, clearMessages };
}
```

**Components**: Use shadcn/ui components from `@/components/ui/`

## Key Architecture Rules

1. **Shared is single source of truth** - all types derive from Zod schemas in shared/
2. **Validate at boundaries** - API endpoints, WebSocket events, database inputs
3. **Backend/frontend decoupled** - they deploy independently
4. **No circular dependencies** between packages
5. **Database logic isolated** in `db/queries/` - return domain types, not raw rows
6. **Users are ephemeral** - tracked in-memory by socket.id, no user table
7. **Messages auto-expire** - cleanup job deletes messages older than 24 hours
