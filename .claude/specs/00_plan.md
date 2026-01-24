Here is your comprehensive, but high level technical development plan:

### I. High-Level Architecture

For a real-time chat application, the architecture differs slightly from a standard CRUD app.

[Image of websocket architecture pattern]

**The Data Flow:**

1.  **The Connection:** The React client establishes a *persistent* bidirectional connection to the Express server via Socket.io.
2.  **The "User":** For the MVP, a "User" is simply an active Socket ID linked to a nickname in the server's memory (RAM).
3.  **The Message:** When a message is sent, it goes to the Server $\rightarrow$ Saved to Postgres (via Drizzle) $\rightarrow$ Broadcasted to all connected clients.

-----

### II. Database Design (PostgreSQL + Drizzle)

You asked about the User entity. For the **MVP**, because users are "ephemeral" (they disappear when they close the tab), **you do not need a User table in the database.** You only need to track them in the application memory.

You only need one table for the MVP.

#### 1\. The `messages` Table

This is the only permanent record we need for now.

```typescript
// server/src/db/schema.ts
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  // In a full app, this would be a userId foreign key.
  // For MVP, we just store the nickname string directly.
  senderNick: text('sender_nick').notNull(), 
  // Default to 'global' for MVP. Helpful for Stretch Goal 1.
  roomId: text('room_id').default('global').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

**Why no User table for MVP?**
If you create a User entity for every person who visits the site, your DB will fill up with "User123", "Guest99" rows that are never used again. It is cleaner to track active users in a JavaScript Map/Object in the server code.

-----

### III. Backend Architecture & Logic (The "Hard" Part)

This is where the magic happens. You will use `Socket.io` which creates an event-based system.

#### State Management (In-Memory)

Since we aren't using a DB for users yet, we need a global variable in your server file:

```typescript
interface User {
  id: string; // The socket.id
  nick: string;
  room: string;
}

// Acts as our "Live Database" for who is online right now
let onlineUsers: User[] = []; 
```

#### The Socket Event Lifecycle

Here is the logic flow you need to implement in your `io.on('connection')` block:

1.  **`join_room`**:

      * **Client sends:** `{ nick: "Alice", room: "global" }`
      * **Server does:**
          * Adds Alice to `onlineUsers` array.
          * Joins the socket to the specific channel: `socket.join("global")`.
          * **Action:** Emits `user_list_update` to everyone in "global" (updates the Right Column).
          * **Action:** Emits `load_history` to Alice (fetches last 50 messages from Postgres).

2.  **`send_message`**:

      * **Client sends:** `{ content: "Hello world", room: "global" }`
      * **Server does:**
          * **Step A (Persistence):** Insert the message into the Postgres `messages` table using Drizzle.
          * **Step B (Broadcast):** Once saved, emit `receive_message` to everyone in the room `io.to("global").emit(...)`.

3.  **`disconnect`** (Built-in event):

      * **Client:** Closes tab.
      * **Server does:** Finds the user by `socket.id`, removes them from `onlineUsers` array, and broadcasts `user_list_update` again so Alice disappears from Bob's screen.

-----

### IV. Step-by-Step Development Plan

Do not try to build the UI and Backend at the same time. Follow this order to maintain sanity.

#### Phase 1: The "Hello World" of Sockets

  * **Goal:** Verify the connection before writing any real code.
  * **Backend:** Set up Express with `http` server and `socket.io`.
  * **Frontend:** Set up React. Inside a `useEffect`, initialize the socket client and log "Connected with ID: xyz" to the console.
  * **Check:** If you see the ID in the browser console, you are ready.

#### Phase 2: The UI Skeleton (Frontend Only)

  * **Goal:** Create the visual structure.
  * **Action:**
      * Create the Login Screen (Input for Nickname).
      * Create the Chat Layout (3 Columns).
      * **Left:** Static text "WeChat".
      * **Middle:** A hardcoded list of dummy messages and an input bar.
      * **Right:** A hardcoded list of dummy users.
  * **State:** Use React `useState` for `messages` array and `users` array.

#### Phase 3: The "Online List" Logic (Backend + Frontend)

  * **Goal:** When I join, I appear on your screen.
  * **Frontend:** When user hits "Enter" on nickname: emit `join_room`.
  * **Backend:** Listen for `join_room`. Update the `onlineUsers` array. Emit `update_user_list`.
  * **Frontend:** Listen for `update_user_list` and update the React state.
  * **Test:** Open the app in one browser tab (Chrome) and another in Incognito. You should see both names in the Right Column.

#### Phase 4: Messaging & Persistence (The DB)

  * **Goal:** Send messages and save them.
  * **Setup:** Configure Drizzle and Postgres. Run the migration for the `messages` table.
  * **Backend:**
      * Implement `send_message` listener.
      * Run `await db.insert(messages)...`.
      * Then `io.to(room).emit(...)`.
  * **Frontend:**
      * Listen for `receive_message`. Append the new message to the local message array.
  * **History:** On the backend `join_room` event, query the DB: `db.select().from(messages)...`. Emit this history to the *specific user* who just joined so they see what happened before they arrived.

#### Phase 5: The Cleanup (24h Rule)

  * **Goal:** Auto-delete old messages.
  * **Implementation:**
      * You don't need complex Cron jobs yet. In your `index.ts`, use a simple interval:
    <!-- end list -->
    ```typescript
    // Check every hour
    setInterval(async () => {
       const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
       await db.delete(messages).where(lt(messages.createdAt, twentyFourHoursAgo));
    }, 1000 * 60 * 60);
    ```

-----

### V. Strategy for Stretch Goals

Since you are thinking ahead, here is how you transition from MVP to Stretch Goals without rewriting everything.

**Stretch 1: Custom Rooms**

  * **Changes:**
      * The backend `join_room` event already accepts a `room` string.
      * Frontend: Instead of hardcoding "global", add a "Create Room" button that generates a random UUID (e.g., `room-a1b2`).
      * Frontend: Update the URL to `wechat.com/room/room-a1b2`.
      * When the page loads, read the URL param. If it exists, join that room ID. If not, join "global".
      * **Database:** The `roomId` column in your table already exists (from step II), so history works automatically per room\!

**Stretch 2: Accounts & Owners**

  * **Changes:**
      * Now you need a `Users` table (id, username, password\_hash).
      * You need an `Auth` middleware for the socket (using JWT tokens).
      * You need a `Rooms` table (id, owner\_id, settings).
      * *Logic:* When a user tries to join a room, check the `Rooms` table. Is it persistent? Does this user have access?

### Next Step

Would you like me to generate the **boilerplate code for the WebSocket server setup** (Phase 1 & 3), or would you prefer the **Drizzle configuration and Schema file** first?