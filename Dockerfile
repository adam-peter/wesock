# Use the official Bun image
FROM oven/bun:1 as base
WORKDIR /app

# 1. Copy root package files
COPY package.json bun.lockb ./

# 2. Copy the necessary folders
# We do NOT need to copy 'frontend' for the backend server
COPY shared ./shared
COPY backend ./backend

# 3. Install dependencies
# This reads the workspace definitions in root package.json
# and links 'shared' into 'backend'
RUN bun install --frozen-lockfile

# 4. Set working directory to backend
WORKDIR /app/backend

# 5. Expose the port (Render usually sets PORT env var)
EXPOSE 3000

# 6. Start the server
# Adjust 'index.ts' to wherever your main server file is inside backend/src
CMD ["bun", "run", "src/index.ts"]