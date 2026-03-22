# Service seasonal scores (weather-aware ranking)

## What it does

- Reads every row in `services` (`id`, `name`, `description`).
- Computes a **multiplier** and optional **reason_key** for each **calendar month (1–12)** using the same India-centric rules as `S9-ml-service/app.py`.
- **Upserts** into `service_seasonal_scores`. **New services** appear automatically on the next daily run.

## One-time: create the table (**no Supabase MCP**)

**Recommended:** add a Postgres URI to `.env` (Supabase Dashboard → **Project Settings → Database → Connection string → URI**):

```env
DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@aws-0-....pooler.supabase.com:6543/postgres
```

Then:

```bash
cd S9-b-end
npm install
npm run setup:seasonal-table
```

This runs `create-service-seasonal-scores.sql` over **`pg`** (direct connection). **Cursor Supabase MCP is not used.**

Aliases (same script):

- `npm run mcp:create-seasonal-table` (legacy name)

**Other options**

- Backend running + `ADMIN_SECRET_KEY`:  
  `node scripts/run-sql.js create-service-seasonal-scores.sql`
- Paste `create-service-seasonal-scores.sql` into the **Supabase SQL Editor**.

**Fallback (no `DATABASE_URL`):** the setup script tries Supabase RPC **`mcp_execute_sql`** if you installed it via `mcp-execute-any-sql.sql`.

## Daily schedule

### Built into the API (default)

While **`node index.js`** is running, a **daily** refresh runs at **02:30 `Asia/Kolkata`** (configurable via env — see `ENV_SETUP_GUIDE.md`: `SEASONAL_SCORES_CRON_EXPRESSION`, `SEASONAL_SCORES_TZ`, `SEASONAL_SCORES_CRON=false` to disable).

### Manual / CI

```bash
cd S9-b-end
npm run refresh-seasonal-scores
```

Example OS cron (if you prefer not to rely on the long-running process):

```cron
0 2 * * * cd /path/to/S9-b-end && /usr/bin/node scripts/refresh-service-seasonal-scores.js >> /var/log/s9-seasonal.log 2>&1
```

Optional env:

- `SEASON_SCORE_COUNTRY` — default `IN` (rules only apply fully for India in ML; table still stores multipliers).

## How recommendations use it

`GET /services/user/:userId/recommendations` loads rows for the **current IST month** from `service_seasonal_scores` and passes them to the ML service as `season_scores_by_service_id` inside `recommendation_context`. If a service has **no row yet** (brand new, before the job ran), ML **falls back** to scoring from `name` + `description` sent in `service_text_by_id`.

## Keeping rules in sync

If you change keywords or phases, update:

1. `S9-ml-service/app.py` (`_season_multiplier_for_text`, `_india_season_phase`, post-monsoon handling)
2. `S9-b-end/lib/seasonServiceScoring.js` (mirror)

Then redeploy ML + backend and re-run the refresh script.
