# CPBattle – Complete Deployment Guide

## Table of Contents
1. [Project Analysis](#1-project-analysis)
2. [UI/UX Improvements](#2-uiux-improvements)
3. [Backend Improvements](#3-backend-improvements)
4. [Folder Structure](#4-folder-structure)
5. [Environment Variables](#5-environment-variables)
6. [Local Development](#6-local-development)
7. [Deploy MongoDB Atlas](#7-deploy-mongodb-atlas)
8. [Deploy Backend to Render](#8-deploy-backend-to-render)
9. [Deploy Frontend to Vercel](#9-deploy-frontend-to-vercel)
10. [Connect Frontend ↔ Backend](#10-connect-frontend--backend)
11. [Test Production Sockets](#11-test-production-sockets)
12. [Production Checklist](#12-production-checklist)
13. [Monitor Logs & Errors](#13-monitor-logs--errors)
14. [Common Bugs & Fixes](#14-common-bugs--fixes)
15. [How to Scale Later](#15-how-to-scale-later)

---

## 1. Project Analysis

**Original codebase issues found:**
- No authentication (no JWT, no persistent sessions)
- No user model or registration/login system
- No rating system (games had no consequence)
- Socket events had no error handling or reconnection logic
- Codeforces polling was naive (no timestamp filtering, prone to false positives)
- No rate limiting, no helmet security headers
- No input validation on any route
- Frontend had no protected routes
- No loading states, no empty states, no error states
- No mobile responsiveness
- Hardcoded `localhost` URLs everywhere
- No environment variable handling

**New architecture:**
- JWT-based auth with persistent login (localStorage + server verify on startup)
- Full User model with Elo rating, match history, wins/losses
- Modular Express routes + middleware
- Robust Socket.IO with reconnect, queue, invite system
- Codeforces polling with timestamp filtering
- Production security: helmet, cors, rate limiting, validation
- React with lazy loading, protected routes, context API
- Tailwind CSS dark theme with glassmorphism, animations

---

## 2. UI/UX Improvements

| Area | Before | After |
|------|--------|-------|
| Theme | Basic light/mixed | Full dark glassmorphism |
| Landing | None | Hero + stats + features + live matches |
| Auth | None | Login + Register with validation |
| Battle | Basic form | Difficulty selector, queue state, invite system |
| Room | Plain text | Timer bar, problem card, solve status |
| Leaderboard | Basic list | Podium, rating tiers, win rate, live refresh |
| Profile | None | Full stats, match history, inline CF handle edit |
| Mobile | Broken | Fully responsive with hamburger nav |
| Errors | None | Toast notifications, empty states, error pages |
| Loading | None | Spinners, skeleton loaders |
| Animations | None | Fade in, slide up, pulse, shimmer |

**New packages added to frontend:**
- `react-hot-toast` – toast notifications
- `framer-motion` – (ready to use for page transitions if needed)
- `lucide-react` – consistent icon system
- `react-router-dom` v6 – routing with lazy loading
- `tailwindcss` – utility-first CSS
- `@headlessui/react` – accessible dropdowns

---

## 3. Backend Improvements

**New packages added:**
- `helmet` – security headers (XSS, clickjacking protection)
- `express-rate-limit` – 200 req/15min globally, 20/15min on auth
- `bcryptjs` – password hashing
- `jsonwebtoken` – JWT auth
- `validator` + `express-validator` – input validation
- `morgan` – HTTP request logging
- `uuid` – room & invite code generation

**New files created:**
```
backend/
├── middleware/
│   ├── auth.js          ← JWT protect middleware
│   └── errorHandler.js  ← centralized error handling
├── models/
│   ├── User.js          ← full user schema + Elo
│   └── Match.js         ← match schema
├── routes/
│   ├── auth.js          ← register, login, /me
│   ├── users.js         ← profile, history, update
│   ├── matches.js       ← recent, live
│   └── leaderboard.js   ← ranked list
├── socket/
│   └── handlers.js      ← all Socket.IO logic
└── utils/
    ├── codeforces.js    ← CF API wrapper
    └── rating.js        ← Elo calculation
```

---

## 4. Folder Structure

```
Daily-CP-Battle/
├── .gitignore
├── docker-compose.yml
├── DEPLOYMENT.md
│
├── backend/
│   ├── .env.example
│   ├── Dockerfile
│   ├── index.js
│   ├── package.json
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   └── Match.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── matches.js
│   │   └── leaderboard.js
│   ├── socket/
│   │   └── handlers.js
│   └── utils/
│       ├── codeforces.js
│       └── rating.js
│
└── frontend/
    ├── .env.example
    ├── vercel.json
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── index.css
        ├── App.jsx
        ├── components/
        │   ├── ProtectedRoute.jsx
        │   ├── layout/
        │   │   ├── Navbar.jsx
        │   │   └── Footer.jsx
        │   └── ui/
        │       └── index.jsx      ← Button, Input, Badge, Spinner, Card, etc.
        ├── context/
        │   └── AuthContext.jsx
        ├── hooks/
        │   ├── useSocket.js
        │   └── useCountdown.js
        ├── pages/
        │   ├── Landing.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Battle.jsx
        │   ├── BattleRoom.jsx
        │   ├── Leaderboard.jsx
        │   ├── Profile.jsx
        │   └── NotFound.jsx
        └── services/
            ├── api.js
            └── socket.js
```

---

## 5. Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=production

MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/daily-cp-battle?retryWrites=true&w=majority

JWT_SECRET=use_a_long_random_string_here_min_32_chars
JWT_EXPIRES_IN=7d

# Comma-separated — include both localhost (dev) and vercel URL (prod)
ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app
```

### Frontend (`frontend/.env`)
```env
REACT_APP_API_URL=https://your-backend.onrender.com
REACT_APP_SOCKET_URL=https://your-backend.onrender.com
```

> ⚠️ Never commit `.env` files. They are in `.gitignore`.

---

## 6. Local Development

```bash
# 1. Clone
git clone https://github.com/aliscodess/Daily-CP-Battle.git
cd Daily-CP-Battle

# 2. Backend setup
cd backend
cp .env.example .env
# → Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev        # runs on :5000

# 3. Frontend setup (new terminal)
cd ../frontend
cp .env.example .env
# → Edit .env: set REACT_APP_API_URL=http://localhost:5000
npm install
npm start          # runs on :3000

# OR use Docker Compose (starts backend + MongoDB)
docker-compose up --build
```

---

## 7. Deploy MongoDB Atlas

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. **Create a free cluster** (M0, any region)
3. **Database Access** → Add user → username + password (save these)
4. **Network Access** → Add IP → `0.0.0.0/0` (allow all — Render uses dynamic IPs)
5. **Connect** → Drivers → Copy connection string
6. Replace `<username>` and `<password>` in the URI
7. Add `/daily-cp-battle` before `?retryWrites` as the database name

**Final URI looks like:**
```
mongodb+srv://alisha:mypassword@cluster0.abc12.mongodb.net/daily-cp-battle?retryWrites=true&w=majority
```

---

## 8. Deploy Backend to Render

1. Go to [render.com](https://render.com) → New → **Web Service**
2. Connect your GitHub repo → Select the repo
3. Settings:
   - **Name:** `cpbattle-api`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Instance:** Free (or Starter for better performance)
4. **Environment Variables** → Add all from `backend/.env`:
   ```
   NODE_ENV         = production
   PORT             = 5000
   MONGODB_URI      = <your Atlas URI>
   JWT_SECRET       = <your secret>
   JWT_EXPIRES_IN   = 7d
   ALLOWED_ORIGINS  = https://your-app.vercel.app
   ```
5. Click **Deploy**
6. Copy the URL: `https://cpbattle-api.onrender.com`

> 💡 **Free tier note:** Render free tier spins down after 15min idle. Upgrade to Starter ($7/mo) for always-on, which is required for Socket.IO in production.

---

## 9. Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

cd frontend

# Set env vars
# Create .env.production:
echo "REACT_APP_API_URL=https://cpbattle-api.onrender.com" > .env.production
echo "REACT_APP_SOCKET_URL=https://cpbattle-api.onrender.com" >> .env.production

# Deploy
vercel --prod
```

**Or via Vercel Dashboard:**
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import GitHub repo
3. **Root Directory:** `frontend`
4. **Build Command:** `npm run build`
5. **Output Directory:** `build`
6. **Environment Variables:**
   ```
   REACT_APP_API_URL    = https://cpbattle-api.onrender.com
   REACT_APP_SOCKET_URL = https://cpbattle-api.onrender.com
   ```
7. Deploy → Copy URL: `https://cpbattle.vercel.app`

8. **IMPORTANT:** Go back to Render → Update `ALLOWED_ORIGINS` to include your Vercel URL.

---

## 10. Connect Frontend ↔ Backend

After both are deployed:

**Step 1 — Update backend CORS** (Render env vars):
```
ALLOWED_ORIGINS = https://cpbattle.vercel.app,http://localhost:3000
```

**Step 2 — Update frontend API URL** (Vercel env vars):
```
REACT_APP_API_URL    = https://cpbattle-api.onrender.com
REACT_APP_SOCKET_URL = https://cpbattle-api.onrender.com
```

**Step 3 — Redeploy both** (Render auto-deploys on env change; trigger Vercel redeploy from dashboard)

**Step 4 — Verify connection:**
```bash
curl https://cpbattle-api.onrender.com/health
# Expected: {"status":"ok","timestamp":"..."}
```

---

## 11. Test Production Sockets

**In browser console on your Vercel URL:**
```javascript
// Test basic socket connection
const { io } = await import('https://cdn.socket.io/4.6.1/socket.io.esm.min.js');
const socket = io('https://cpbattle-api.onrender.com', {
  transports: ['websocket'],
});
socket.on('connect', () => console.log('✅ Socket connected:', socket.id));
socket.on('connect_error', (err) => console.error('❌ Socket error:', err.message));
```

**Test full flow:**
1. Register two accounts (use two different browsers/incognito)
2. Add Codeforces handles for both users (Profile page)
3. User 1 → Battle → Find Match (any difficulty)
4. User 2 → Battle → Find Match (any difficulty)
5. Both should get `match_started` event → navigate to `/room/:id`
6. Open the problem link on Codeforces, submit a solution
7. Wait for auto-poll (15s) or click "I Submitted"
8. Match should end with rating changes

---

## 12. Production Checklist

- [ ] MongoDB Atlas cluster created with proper user + IP whitelist
- [ ] Backend deployed on Render with all env vars set
- [ ] Frontend deployed on Vercel with correct API URLs
- [ ] CORS `ALLOWED_ORIGINS` includes production frontend URL
- [ ] JWT_SECRET is at least 32 random characters
- [ ] `NODE_ENV=production` set on Render
- [ ] Health endpoint responding: `/health`
- [ ] Test register → login → find match → battle flow end-to-end
- [ ] Test invite code flow
- [ ] Test leaderboard loads
- [ ] Test profile page and CF handle update
- [ ] Socket reconnection works (disable network briefly, re-enable)
- [ ] Mobile layout tested on real device

---

## 13. Monitor Logs & Errors

### Render (Backend)
- Dashboard → Your service → **Logs** tab (real-time streaming)
- Filter by `[Error]`, `[Socket]`, `[Match]`

### Vercel (Frontend)
- Dashboard → Project → **Functions** tab (SSR — n/a for CRA)
- Browser DevTools Console for client-side errors

### MongoDB Atlas
- Cluster → **Monitoring** tab → queries, connections, opcounters

### Add Sentry (recommended for production):
```bash
# Frontend
npm install @sentry/react
# Backend
npm install @sentry/node

# In backend/index.js (top):
const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.2 });
app.use(Sentry.Handlers.requestHandler());
// ... routes ...
app.use(Sentry.Handlers.errorHandler());
```

---

## 14. Common Bugs & Fixes

### ❌ "CORS error" in browser
**Fix:** In Render env vars, set `ALLOWED_ORIGINS` to your exact Vercel URL (no trailing slash).
```
ALLOWED_ORIGINS=https://cpbattle.vercel.app
```

### ❌ Socket.IO connects but immediately disconnects
**Fix:** Render free tier sleeps. Upgrade to Starter, or add a keep-alive ping:
```javascript
// In frontend socket.js:
setInterval(() => socket.emit('ping'), 25000);
```

### ❌ "Invalid token" after page refresh
**Fix:** Already handled — `AuthContext` calls `/api/auth/me` on mount to revalidate token. Ensure `JWT_SECRET` is consistent (not regenerated on restart).

### ❌ Match never starts (stuck in queue)
**Fix:** Both players must have the same `difficulty` selected. Use `any` for testing. Check Render logs for `[startMatch]` errors.

### ❌ Codeforces always returns "not solved"
**Fix:** Ensure `codeforcesHandle` is set correctly (case-sensitive). The handle must match exactly what's on codeforces.com. The submission must be AFTER the match `startTime`.

### ❌ MongoDB "MongoServerSelectionError"
**Fix:** In Atlas → Network Access, ensure `0.0.0.0/0` is whitelisted (Render uses dynamic IPs).

### ❌ Render build fails
**Fix:** Ensure `package.json` `engines.node` is set to `>=18`. Check that all dependencies are in `dependencies` (not just `devDependencies`).

### ❌ Vercel 404 on page refresh
**Fix:** `vercel.json` already included with the rewrite rule. Ensure it's in `frontend/` root.

---

## 15. How to Scale Later

### When you hit 100+ concurrent users:

**Backend:**
- Move from Render Starter to Render Standard (2+ instances)
- Use Redis adapter for Socket.IO (required for multi-instance):
  ```bash
  npm install @socket.io/redis-adapter redis
  ```
  ```javascript
  const { createAdapter } = require('@socket.io/redis-adapter');
  const { createClient } = require('redis');
  const pub = createClient({ url: process.env.REDIS_URL });
  const sub = pub.duplicate();
  await Promise.all([pub.connect(), sub.connect()]);
  io.adapter(createAdapter(pub, sub));
  ```
- Add Redis for session/queue management (Upstash Redis — free tier available)

**Database:**
- Upgrade MongoDB Atlas from M0 (free) to M10 ($57/mo) for dedicated cluster
- Add indexes: already added on `status`, `player1.userId`, `player2.userId`
- Add `createdAt` TTL index on old matches to auto-purge

**Frontend:**
- Vercel auto-scales, no action needed
- Enable Vercel Analytics for real user monitoring

**Codeforces API:**
- Add exponential backoff on polling failures
- Cache problem list (fetched once per hour, stored in Redis)
- Rate limit: CF API allows ~5 req/s, our polling is every 15s per match so this is fine up to ~4000 concurrent matches

**Security at scale:**
- Add Cloudflare proxy (free DDoS protection + CDN)
- Enable Cloudflare WAF rules
- Add brute-force protection on login (already has rate limiting)
- Consider adding email verification for new accounts
