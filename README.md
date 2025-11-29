# WeSock
...websocket real-time chat application

## Deployment Notes:
**Vercel (Frontend)**:
- Root Directory: frontend
- Install Command: cd .. && bun install && cd frontend
- ✅ Enable: "Include source files outside of the Root Directory"

**Render/Railway (Backend)**:
- Root Directory: backend
- Build Command: bun install && bun run build
- Watch Paths: backend/**, shared/**
- Environment Variables:
  - `PLATFORM`: `prod`
  - `DATABASE_URL`: your database URL
  - `ALLOWED_ORIGINS`: comma-separated list of allowed origins (e.g., `https://wesock.vercel.app,https://your-custom-domain.com`)
  
**Local Development**:
- Backend uses `http://localhost:5173` as default allowed origin
- To add more origins locally, set `ALLOWED_ORIGINS` environment variable