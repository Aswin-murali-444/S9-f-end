# Deploy S9 on Render (with Cursor Render MCP)

Your Git remotes (latest commits should be pushed here first):

| App | GitHub repo | Branch | Render type |
|-----|-------------|--------|-------------|
| API | `https://github.com/Aswin-murali-444/S9-b-end.git` | `main` | **Web Service** (Node) |
| Frontend | `https://github.com/Aswin-murali-444/S9-f-end.git` | `master` | **Static Site** |
| ML | `https://github.com/Aswin-murali-444/ML-services.git` | `main` | **Web Service** (Python) |

### Live services (Nexus workspace `tea-cvifdiidbo4c738o4db0`)

| Service | Type | URL | Dashboard |
|---------|------|-----|-----------|
| **Nexus** (API) | Web (Node) | https://nexus-d2dx.onrender.com | [Open](https://dashboard.render.com/web/srv-d3rio0c9c44c73anlpv0) |
| **nexus-ml-services** | Web (Python) | https://nexus-ml-services.onrender.com | [Open](https://dashboard.render.com/web/srv-d6v3lusr85hc73b4ukk0) |

ML code stays in **Git** (`ML-services`); Render **hosts** the running app from that repo (auto-deploy on `main`). Health check: `GET https://nexus-ml-services.onrender.com/health`

## 1. Render MCP in Cursor

- MCP server id in Cursor: **`user-render`** (Render’s hosted MCP).
- Your project’s `.cursor/mcp.json` can stay minimal; the global Cursor MCP config (with your Render API key) is what enables the tools.

## 2. Select a Render workspace (required once per session)

Render MCP returns **no workspace set** until you pick one. Your account has:

| Workspace | `ownerID` (for MCP) |
|-----------|---------------------|
| **Nexus** | `tea-cvifdiidbo4c738o4db0` |
| **todo** | `tea-cvmatvpr0fns738q5sn0` |

In chat, say explicitly which workspace to use, e.g.  
**“Select Render workspace Nexus”**  
so the assistant can call `select_workspace` with that `ownerID`.

## 3. After workspace is selected

Ask the assistant to:

1. `list_services` — see existing services.
2. Either **update** existing services to the repos/branches above or **create** new ones (see commands below).
3. Set **Environment** in the Render dashboard (not in git): copy from local `.env` / `VITE_*` — never commit secrets.

### Backend — Web Service (Node)

- **Root directory:** repo root (or leave default if repo is only backend).
- **Build command:** `npm install`
- **Start command:** `npm start`
- **Env:** `PORT` is set by Render; add all variables from `S9-b-end/.env` in the Render **Environment** tab.

### Frontend — Static Site (Vite)

- **Build command:** `npm install && npm run build`
- **Publish directory:** `dist`
- **Build env:** set `VITE_API_URL` to your **public** backend URL (e.g. `https://your-api.onrender.com`).

### ML — Web Service (Python)

- **Build command:** `pip install -r requirements.txt`
- **Start command:** `gunicorn --bind 0.0.0.0:$PORT app:app`
- Optional health check path: `/health`

## 4. “Latest commit” behavior

With **Auto-Deploy** enabled (default for new services from Git), each push to the connected branch triggers a new deploy. After pushing locally:

```bash
git push origin main   # or master for S9-f-end
```

## 5. If MCP “create” is too limited

Use the dashboard (full options, root directory, health checks):

- Web: https://dashboard.render.com/web/new  
- Static: https://dashboard.render.com/static/new  

---

**Workspace:** Nexus (`tea-cvifdiidbo4c738o4db0`) is configured for MCP.  
**Still to add (if you want):** Static site for `S9-f-end` on branch `master`, and point `VITE_API_URL` at `https://nexus-d2dx.onrender.com` (or your custom domain).
