# ReelTokz Web (Production-ready starter)

A secure, responsive web version of the ReelTokz experience.

## Tech stack
- Next.js (App Router) + TypeScript
- Tailwind CSS (American-flag theme: blue/red/white/black, black emphasized)
- Auth.js / NextAuth for X(Twitter), Facebook, Google, and email/password
- MongoDB (Auth adapter) + MongoDB/Mongoose app models
- Zod validation + rate limiting + secure headers
- Admin panel (RBAC)

## Quick start
1) Copy `.env.example` → `.env.local` and fill values  
2) Install & run:
```bash
npm install
npm run dev
```

## Deploy to Vercel
- Import this repo in Vercel
- Add all env vars from `.env.example` to Vercel Project Settings
- Deploy

> Realtime chat: Vercel serverless isn’t ideal for WebSockets. This starter ships REST messages; see `docs/realtime-chat.md`.

## Account recovery
- **Forgot username**: email reminder
- **Reset password**: secure token link to email
- If the user **lost access to email**, they can recover by signing in with a linked OAuth provider (X/Facebook/Google). Otherwise, owner/admin can help.


## Added features (v2)

### Groups
- Create groups, join/leave, private join requests
- Owner/admin management (approve requests, promote/demote, remove)

### Launch coins from a post (pump.fun / bonk.fun)
- Wizard flow that mirrors pump.fun/bonk.fun creation steps
- Uses PumpPortal Local Transaction API + pump.fun IPFS metadata endpoint
Docs: https://pumpportal.fun/creation/

### x402 paywalled posts
- Mark a post as paywalled with a USD price
- Paid content served from `/p/[postId]` and protected by x402 middleware (x402-next)
- Platform fee configurable in Admin → Monetization

### Wallet login/linking
- EVM: Sign-In With Ethereum (SIWE) verification
- Solana: signed message verification compatible with SIWS-style flows


## Billing (Stripe) + RGC Credits + Reel Mail

### Stripe
- Subscriptions: `/api/billing/subscribe` uses Stripe Checkout (subscription mode)
- Credit packs: `/api/billing/buy-rgc` uses Stripe Checkout (payment mode)
- Webhook: `/api/billing/stripe-webhook` updates subscription tier and credits balance

### RGC Credits
- Balance + ledger: `/api/rgc/balance`
- Ledger model: `models/CreditLedger.ts`

### Reel Mail
- Feed/inbox fetch + send: `/api/reelmail`
- View reward (unique view): `/api/reelmail/[id]/view`
- Posting Reel Mail charges the sender RGC (send cost + reward pool)
- Watching Reel Mail can earn RGC from the sender-funded pool


### Packages (mirrored from mobile)
- FREE Package: +20 signup RGC, +10 monthly
- GOLD Package: $5.99/mo, +20 start bonus, +20 monthly (invoice.paid)
- BUSINESS Basic: $14.99/mo, +50 start bonus, +50 monthly (invoice.paid)
- COINS: $6.99 one-time, +20 RGC
