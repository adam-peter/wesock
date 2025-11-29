# 🧵 WeSock

![WeSock](wesock.png)

WeSock is a FOSS real-time chat application built to be accessible and freely usable for everyone. It is built with a modern TypeScript stack, utilizing scalable WebSocket patterns, strict type safety, and a clean monorepo architecture.

WeSock features ephemeral users, persistent room history, and real-time updates, all powered by a robust event-driven backend.

## 🚀 Tech Stack

### Frontend
- **Framework:** React 19 (Vite)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS v4, shadcn/ui components
- **Real-time:** Socket.io Client
- **Routing:** React Router v7

### Backend
- **Runtime:** Node.js (via Bun)
- **Server:** Express.js + Socket.io Server
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Validation:** Zod

### Shared & Tooling
- **Monorepo:** Bun Workspaces
- **Type Safety:** Shared Zod schemas (Single Source of Truth)
- **Linting:** ESLint + TypeScript-ESLint

## 🏗 Architecture

WeSock follows a decoupled monorepo structure:

```
wesock/
├── backend/          # Express + Socket.io server
├── frontend/         # React application
└── shared/           # Shared Types & Zod Schemas
```

### Key Concepts
- **Ephemeral Users:** No user accounts are stored in the database. Users are tracked in-memory by their socket ID and chosen nickname.
- **Persistent History:** Messages are stored in PostgreSQL for history retrieval but are auto-deleted after 24 hours to maintain hygiene.
- **Type Safety:** Zod schemas in the `shared` package drive both runtime validation (API/Sockets) and static type inference.

## 🛠 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (v1.0+)
- [Docker](https://www.docker.com/) (for PostgreSQL)

### 1. Installation
Clone the repository and install dependencies using Bun:

```bash
git clone <repository-url>
cd wesock
bun install
```

### 2. Environment Setup
Configure environment variables for both the backend and frontend.

**Backend:**
```bash
cd backend
cp .env.example .env
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
```

### 3. Database Setup
For easiest local development, I recommend to run PostgreSQL natively.

1.  **Install & Start PostgreSQL** (Example using Homebrew on macOS):
    ```bash
    brew install postgresql
    brew services start postgresql
    ```

2.  **Create the Database:**
    Connect to the default `postgres` database and create the `wesock` database:
    ```bash
    psql postgres
    # Inside the psql shell:
    postgres=# CREATE DATABASE wesock;
    postgres=# \q
    ```

3.  **Configure Connection:**
    Open `backend/.env` and update the `DATABASE_URL` to match your local setup.
    *   *Example for macOS (no password usually required):*
        `postgresql://<your_username>@localhost:5432/wesock`
    *   *Example with password:*
        `postgresql://postgres:password@localhost:5432/wesock`

4.  **Run Migrations:**
    Apply the database schema:
    ```bash
    cd backend
    bun run db:migrate
    ```

### 4. Running the Application
Start both the backend and frontend in development mode from the root directory:

```bash
bun run dev
```

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000

## ✨ Features

- **Real-time Messaging:** Instant message delivery to all users in a room.
- **Rooms:** Join 'global' by default or create/join custom rooms via URL.
- **Message History:** New users see the last 50 messages upon joining.
- **Live User List:** See who is currently online in your room.
- **Auto-Cleanup:** Messages older than 24 hours are automatically removed.

## 🗺 Roadmap

- [ ] **User Authentication:** Persistent user accounts and profiles.
- [ ] **Private Messaging:** Direct 1-on-1 messages between users.
- [ ] **Rich Media:** Support for image and file uploads.
- [ ] **End-to-End Encryption:** Encrypt private messages for enhanced privacy.
- [ ] **Typing Indicators:** Real-time "User is typing..." feedback.
- [ ] **Read Receipts:** Indicators for when messages have been read.
