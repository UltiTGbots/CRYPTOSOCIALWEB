# Realtime chat on Vercel

Vercel serverless functions are not a great fit for long-lived WebSocket connections.

This starter implements messages via REST endpoints in `/api/messages`.

To upgrade to realtime:
- Use Ably or Pusher.
- Publish messages in `POST /api/messages`.
- Subscribe client-side in `/messages` and append new messages as they arrive.
