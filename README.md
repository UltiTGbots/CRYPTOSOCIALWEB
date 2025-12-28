# ReelTokz Monorepo (Mobile + Backend)

This repo contains:
- `backend/` Express + MongoDB API (deployable to Vercel as a Serverless Function)
- `mobile/` Expo React Native app (not deployed to Vercel; build with Expo/EAS)

## Deploy backend to Vercel
1. Push this repo to GitHub.
2. In Vercel, import the repo.
3. Vercel will use the root `vercel.json` to deploy `backend/api/index.js`.

### Important notes
- WebSockets (Socket.IO) do **not** run on Vercel Serverless. REST APIs will work. If you need real-time chat on Vercel, use a managed websocket provider or move the backend to a long-running host (Render/Fly/EC2/etc).
- Set environment variables in Vercel for your backend (Mongo URI, JWT secret, AWS/Cloudinary, Stripe, Firebase, etc).

## Run locally
```bash
npm install --workspaces
npm run dev:backend
npm run dev:mobile
```


## Web (Next.js)

- Source: `web/` (deploy this folder to Vercel)
- Dev: `npm run dev:web`
- Env: copy `web/.env.example` to `web/.env.local` and set variables in Vercel.
# CRYPTOSOCIALWEB
