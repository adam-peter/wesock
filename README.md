# WeSock
...websocket real-time chat application

## Deployment Notes:
**Vercel (Frontend)**:
- Root Directory: frontend
- Install Command: cd .. && bun install && cd frontend
- ✅ Enable: "Include source files outside of the Root Directory"

**Netlify/Railway (Backend)**:
- Root Directory: backend
- Build Command: bun install && bun run build
- Watch Paths: backend/**, shared/**