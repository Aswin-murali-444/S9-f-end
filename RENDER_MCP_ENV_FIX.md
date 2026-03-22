# Render env fix (via Cursor `user-render` MCP)

Applied **2026-03-22** to workspace **Nexus** for Web service **Nexus** (`srv-d3rio0c9c44c73anlpv0`).

## What was wrong

- `ML_SERVICE_URL` pointed at **localhost** → Render’s API could not reach your laptop’s ML process.
- `VITE_API_URL` on the API service was **`nexus-d2hx`** — the live API hostname is **`nexus-d2dx`** (typo risk).
- `NODE_ENV` was **`development`** on production.

## What MCP merged (non-destructive merge)

| Key | Value |
|-----|--------|
| `ML_SERVICE_URL` | `https://nexus-ml-services.onrender.com` |
| `NODE_ENV` | `production` |
| `OPENROUTER_SITE_URL` | `https://nexus-d2dx.onrender.com` |
| `VITE_API_URL` | `https://nexus-d2dx.onrender.com` |

A **new deploy** was triggered automatically.

## What you should still do in the Render dashboard

1. **`FRONTEND_URL`** — set to your **real** Vercel URL (e.g. `https://<project>.vercel.app`), not `localhost`.
2. **`PORT`** — if you set `PORT=3001` manually, **delete** it and let Render inject `PORT`; ensure `index.js` uses `process.env.PORT`.
3. **Vercel** — set **`VITE_API_URL`** = `https://nexus-d2dx.onrender.com` and **redeploy** the frontend (Vite bakes env at build time).

## Verify

```http
GET https://nexus-d2dx.onrender.com/health
GET https://nexus-d2dx.onrender.com/services/diagnostics
GET https://nexus-ml-services.onrender.com/health
```

`diagnostics` should show `mlServiceHostIsUnreachableFromHosted: false` after the deploy finishes.

## MCP reminder

1. Select workspace: **Nexus** (`tea-cvifdiidbo4c738o4db0`).
2. Tool: **`update_environment_variables`** with `serviceId` + `envVars` (use `replace: false` to merge).
