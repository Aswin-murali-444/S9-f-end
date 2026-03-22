# Hosting checklist (Render + Vercel + Supabase)

Use this so **Vercel**, **Render**, and **Supabase** stay aligned. MCP servers: `user-render`, `user-vercel`, `user-supabase`.

## URLs (current defaults)

| Layer | URL |
|-------|-----|
| API (Render) | `https://nexus-d2dx.onrender.com` (**not** `d2hx` — common typo) |
| ML (Render) | `https://nexus-ml-services.onrender.com` |
| Frontend (Vercel) | Your project domain, e.g. `https://s9-f-end.vercel.app` |
| Supabase | Project URL from Supabase dashboard |

## Render — Web service **Nexus** (`S9-b-end`)

**Environment variables** (mirror `S9-b-end/.env`, never commit `.env`):

- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, etc.
- `ML_SERVICE_URL=https://nexus-ml-services.onrender.com`
- Optional: `CORS_ORIGINS` / `FRONTEND_URL` if you use a non-Vercel domain

**CORS:** Backend allows `*.vercel.app` plus `CORS_ORIGINS` / `FRONTEND_URL` / `s9-f-end` patterns.

## Render — **nexus-ml-services** (`ML-services` repo)

- Branch `main`, auto-deploy on push.
- Start: `gunicorn --bind 0.0.0.0:$PORT app:app`

## Vercel — project **s9-f-end**

1. **Root directory**
   - **Either** leave **Root Directory = `.`** (repo root) — a root `vercel.json` builds `S9-f-end/` and outputs `S9-f-end/dist`.
   - **Or** set **Root Directory = `S9-f-end`** — then `S9-f-end/vercel.json` applies (`installCommand` includes dev deps for Vite).

2. **Production branch:** `master` (if that is what you push).

3. **Environment variables** (Vite only exposes `VITE_*`):

   | Variable | Purpose |
   |----------|---------|
   | `VITE_API_URL` | `https://nexus-d2dx.onrender.com` (recommended; also have a code fallback) |
   | `VITE_SUPABASE_URL` | Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
   | `VITE_RAZORPAY_KEY_ID` | If you use Razorpay on the client |

4. **Common build error fixed:** `vite: command not found` → `installCommand` uses `npm install --include=dev` so Vite (devDependency) is installed on Vercel.

## Supabase

- **Auth:** Add your Vercel URL(s) under **Authentication → URL configuration** (Site URL, Redirect URLs).
- **Keys:** Use the same project as in Render (`SUPABASE_*` server-side) and `VITE_SUPABASE_*` (client).

## Verify

```text
GET https://nexus-d2dx.onrender.com/health
GET https://nexus-ml-services.onrender.com/health
```

Open your Vercel URL → browser console should show API base resolving to Render (check Network tab for API calls).

## MCP quick checks

- **Vercel:** `list_deployments` — state should be `READY`, not `ERROR`.
- **Render:** `list_services` — services not suspended.
- **Supabase:** `get_advisors` / project URL tools as needed.
