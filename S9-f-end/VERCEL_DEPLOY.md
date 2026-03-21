# Deploy S9-f-end on Vercel

## 1. Import the repo

1. Go to [vercel.com/new](https://vercel.com/new).
2. Import **`Aswin-murali-444/S9-f-end`** from GitHub.
3. **Root directory:** leave as `.` (repo root is the app).
4. **Production branch:** if GitHub default is `main` but you deploy from **`master`**, set **Settings → Git → Production Branch** to `master` after the first import.

Vercel will detect **Vite**. This repo includes `vercel.json` (SPA fallback so React Router routes work).

## 2. Environment variables (required for API + features)

Add these in **Project → Settings → Environment Variables** (check **Production** and **Preview** as needed):

| Name | Example / notes |
|------|------------------|
| `VITE_API_URL` | `https://nexus-d2dx.onrender.com` — your Render **Nexus** backend (no trailing slash). **Required** so the browser calls Render instead of `/api` on Vercel. |
| `VITE_SUPABASE_URL` | Your Supabase project URL (if not relying on code defaults). |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key. |
| `VITE_RAZORPAY_KEY_ID` | Razorpay key for checkout (optional for non-payment pages). |

Redeploy after changing env vars (**Deployments → … → Redeploy**).

## 3. Fix CORS on the backend (Render)

The API must allow your Vercel origin. On **Render → Nexus → Environment** add:

```text
CORS_ORIGINS=https://YOUR-PROJECT.vercel.app,https://YOUR-PROJECT-git-main-xxx.vercel.app
```

Use your real Vercel URL(s), comma-separated, no spaces (or trim spaces — backend trims).

Alternatively set a single primary URL:

```text
FRONTEND_URL=https://YOUR-PROJECT.vercel.app
```

Redeploy **Nexus** after saving.

## 4. Verify

- Open your Vercel URL → app loads.
- Browser **Network** tab: API calls go to `https://nexus-d2dx.onrender.com/...` (or your `VITE_API_URL`).
- If you see CORS errors, double-check `CORS_ORIGINS` / `FRONTEND_URL` on Render matches the exact Vercel origin (including `https://`).

## 5. CLI (optional)

```bash
cd S9-f-end
npm i -g vercel
vercel login
vercel --prod
```

Set the same env vars in the dashboard or via `vercel env add`.
