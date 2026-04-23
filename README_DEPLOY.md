# Deployment Instructions for Dance Studio Management System

This project is production-ready and security-hardened. Follow these steps to deploy.

---

## Architecture Overview

```
┌─────────────────────────┐    ┌──────────────────────────┐
│  Studio Frontend (Vite) │    │  Admin Frontend (Vite)   │
│  Public Registration    │    │  Dashboard + Management  │
│  Payment Portal         │    │  Students, Payments, Regs │
│  Port: 5173 (dev)       │    │  Port: 5174 (dev)        │
└────────────┬────────────┘    └────────────┬─────────────┘
             │                              │
             ▼                              ▼
┌─────────────────────────┐    ┌──────────────────────────┐
│  Registration Backend   │    │  Admin Backend            │
│  Port: 5000             │    │  Port: 5001               │
│  POST /api/register     │    │  Students CRUD            │
│  Socket.io real-time    │    │  Payments + Fee Alerts     │
│                         │    │  Cron: 09:00 AM IST daily  │
│                         │    │  Socket.io real-time       │
└────────────┬────────────┘    └────────────┬─────────────┘
             │                              │
             └──────────┬───────────────────┘
                        ▼
              ┌───────────────────┐
              │  MongoDB Atlas    │
              │  (Shared DB)      │
              └───────────────────┘
```

---

## 1. Backend — Registration Server (Node.js/Express)

Deploy the contents of `dance studio/backend/` to **Render, Railway, or Heroku**.

### Environment Variables (Required)

| Variable         | Description                                                     | Example                                         |
| ---------------- | --------------------------------------------------------------- | ----------------------------------------------- |
| `PORT`           | Server port (usually auto-set by host)                          | `5000`                                          |
| `MONGODB_URI`    | MongoDB Atlas connection string                                 | `mongodb+srv://user:pass@cluster.mongodb.net/`  |
| `NODE_ENV`       | Set to `production` for live deployment                         | `production`                                    |
| `ALLOWED_ORIGINS`| Comma-separated frontend URLs for CORS                          | `https://yourstudio.com,https://youradmin.com`  |
| `WHATSAPP_API_URL`| WhatsApp API provider endpoint (optional)                      | `https://api.provider.com/send`                 |
| `WHATSAPP_API_KEY`| WhatsApp API key (optional)                                     | `your_api_key_here`                             |

---

## 2. Backend — Admin Server (Node.js/Express)

Deploy the contents of `dance studio admin/backend/` to **Render, Railway, or Heroku**.

### Environment Variables (Required)

| Variable         | Description                                                     | Example                                         |
| ---------------- | --------------------------------------------------------------- | ----------------------------------------------- |
| `PORT`           | Server port (usually auto-set by host)                          | `5001`                                          |
| `MONGODB_URI`    | MongoDB Atlas connection string                                 | `mongodb+srv://user:pass@cluster.mongodb.net/`  |
| `NODE_ENV`       | Set to `production` for live deployment                         | `production`                                    |
| `TZ`             | Timezone for cron scheduler                                     | `Asia/Kolkata`                                  |
| `ALLOWED_ORIGINS`| Comma-separated frontend URLs for CORS                          | `https://yourstudio.com,https://youradmin.com`  |
| `STUDIO_URL`     | Public studio URL (used in WhatsApp payment links)              | `https://yourstudio.com`                        |
| `WHATSAPP_API_URL`| WhatsApp API provider endpoint (optional)                      | `https://api.provider.com/send`                 |
| `WHATSAPP_API_KEY`| WhatsApp API key (optional)                                     | `your_api_key_here`                             |

---

## 3. Frontend — Studio Landing Page (React/Vite)

Deploy the contents of `dance studio/studio/` to **Vercel or Netlify**.

### Environment Variables

| Variable            | Description                                     | Example                                      |
| ------------------- | ----------------------------------------------- | -------------------------------------------- |
| `VITE_API_URL`      | Registration backend URL + /api                 | `https://your-reg-backend.onrender.com/api`  |
| `VITE_ADMIN_API_URL`| Admin backend URL + /api (for Payment Portal)   | `https://your-admin-backend.onrender.com/api`|

### Build Command
```
npm run build
```

---

## 4. Frontend — Admin Panel (React/Vite)

Deploy the contents of `dance studio admin/frontend/admin/` to **Vercel or Netlify**.

### Environment Variables

| Variable       | Description                          | Example                                       |
| -------------- | ------------------------------------ | --------------------------------------------- |
| `VITE_API_URL` | Admin backend URL + /api             | `https://your-admin-backend.onrender.com/api` |

### Build Command
```
npm run build
```

---

## Pre-Deployment Checklist

- [ ] Set `NODE_ENV=production` on both backends
- [ ] Set `ALLOWED_ORIGINS` to your actual frontend domains (no wildcards!)
- [ ] Set `STUDIO_URL` to your public studio URL (for WhatsApp payment links)
- [ ] Set `TZ=Asia/Kolkata` on admin backend for correct cron scheduling
- [ ] Configure MongoDB Atlas IP whitelist (`0.0.0.0/0` if unsure)
- [ ] Ensure `VITE_API_URL` is set before building frontends
- [ ] Ensure `VITE_ADMIN_API_URL` is set for the studio frontend (for PayPortal)
- [ ] Run `npm test` in admin backend to verify all unit tests pass
- [ ] Check `/health` endpoint on both backends after deployment

---

## Health Checks

Both backends expose a `/health` endpoint:
```
GET https://your-backend.onrender.com/health
→ { "status": "healthy", "db": "connected", "uptime": 1234.56 }
```

Use this for monitoring tools (UptimeRobot, Render health checks, etc.)

---

## Security Features (Built-in)

- ✅ Helmet.js security headers (CSP, HSTS, XSS protection, etc.)
- ✅ CORS restricted to whitelisted origins only
- ✅ Request body size limited to 1MB
- ✅ Input validation on all models (trim, regex, min/max)
- ✅ Graceful shutdown on SIGTERM/SIGINT
- ✅ No credentials logged to console
- ✅ Proper error handling — no stack traces leaked to clients

---

## Running Tests

```bash
# Run the comprehensive test suite (pure logic + API integration)
cd "dance studio admin/backend"
npm test

# Tests will automatically skip API tests if servers are not running
```
