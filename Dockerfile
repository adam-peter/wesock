# Use the official Bun image (specific version to match yours)
FROM oven/bun:1.2.4 AS base
WORKDIR /app

# 1. Copy root package files
# Note: We use bun.lock (text) instead of bun.lockb (binary) for Bun v1.2+
COPY package.json bun.lock ./

# 2. Copy ALL workspace folders
# We MUST copy frontend because root package.json lists it as a workspace.
# Without it, 'bun install' fails validation.
COPY shared ./shared
COPY backend ./backend
COPY frontend ./frontend

# 3. Install dependencies
# --frozen-lockfile ensures it matches your local setup exactly
RUN bun install --frozen-lockfile

# 4. Set working directory to backend
WORKDIR /app/backend

# 5. Expose the port
EXPOSE 3000

# 6. Start the server
CMD ["bun", "run", "src/index.ts"]