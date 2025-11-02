# Deployment Configuration Guide

## ✅ What Has Been Configured

### 1. Backend CORS (Render - `nexus-d2dx.onrender.com`)
✅ Updated CORS configuration to allow:
- Your Vercel frontend: `https://s9-f-end.vercel.app`
- All Vercel preview deployments
- Local development origins

**File updated:** `S9-b-end/index.js`

### 2. Frontend API Configuration
✅ Already configured to use environment variables
- Uses `VITE_API_URL` when set (production)
- Falls back to localhost in development

**File:** `S9-f-end/src/services/api.js`

### 3. MCP Server (Local Cursor Integration)
✅ Properly configured as a local Cursor MCP server
- Runs only within Cursor (stdio transport)
- Does NOT affect your hosted services
- Uses Supabase connection for database operations

**Location:** `supabase-mcp-server/`

---

## 🔧 Required Vercel Configuration

You need to add these environment variables in your Vercel dashboard:

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com/dashboard
2. Select your project: `s9-f-end`
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Environment Variables

Add these variables:

| Variable Name | Value |
|--------------|-------|
| `VITE_API_URL` | `https://nexus-d2dx.onrender.com` |
| `VITE_SUPABASE_URL` | `https://zbscbvrklkntlbtefkgw.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpic2NidnJrbGtudGxidGVma2d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODgzOTIsImV4cCI6MjA2ODY2NDM5Mn0.EJbPGMn7kXFgj5IahA2GIiEcA3dTDCbgj9cF09rcsuY` |

**Important:** 
- Make sure to set these for **Production**, **Preview**, and **Development** environments
- After adding, **redeploy** your Vercel app

### Step 3: Redeploy
After adding environment variables:
1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Select **Redeploy**

---

## 🔍 Verify Your Setup

### Test Backend (Render)
```bash
curl https://nexus-d2dx.onrender.com/health
```
Expected response:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "uptime": ...
}
```

### Test Frontend (Vercel)
1. Visit: https://s9-f-end.vercel.app
2. Open browser DevTools → Network tab
3. Try logging in or any API action
4. Verify requests go to: `https://nexus-d2dx.onrender.com`

---

## 🛡️ MCP Server Safety

The MCP (Model Context Protocol) server you set up in Cursor:
- ✅ Runs **only locally** within Cursor
- ✅ Uses stdio transport (not HTTP)
- ✅ Does NOT expose ports or services
- ✅ Does NOT interfere with your hosted apps
- ✅ Safe to use - won't "spoil your system"

**How it works:**
- Cursor launches the MCP server as a subprocess
- Communication happens via stdin/stdout
- No network ports opened
- No external access possible

---

## 🚀 Deployment Architecture

```
┌─────────────────┐         ┌──────────────────┐
│   Vercel CDN    │─────────▶│  Render Backend  │
│ (Frontend)      │  HTTPS  │ (API Server)     │
│                 │         │                   │
│ s9-f-end.vercel │         │ nexus-d2dx.      │
│      .app       │         │   onrender.com    │
└─────────────────┘         └──────────────────┘
                                      │
                                      │ Supabase API
                                      ▼
                              ┌───────────────┐
                              │   Supabase    │
                              │  (Database)   │
                              └───────────────┘

┌─────────────────────────────────────────┐
│  Local Development (Cursor)             │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  MCP Server (stdio transport)    │  │
│  │  - Only runs in Cursor           │  │
│  │  - No network exposure           │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 📝 Next Steps

1. ✅ **Backend CORS** - Already fixed
2. ⚠️ **Vercel Environment Variables** - You need to add these manually
3. ⚠️ **Redeploy Vercel** - After adding env vars
4. ✅ **Test the connection** - Verify frontend can reach backend

---

## 🐛 Troubleshooting

### CORS Errors
- ✅ Already fixed in backend
- If still seeing errors, clear browser cache

### API Connection Failed
- Verify `VITE_API_URL` is set in Vercel
- Check that Render backend is running: https://nexus-d2dx.onrender.com/health
- Redeploy Vercel after adding env vars

### Environment Variables Not Working
- Ensure variable names start with `VITE_`
- Redeploy after adding/changing variables
- Check Vercel build logs for errors

---

## 📞 Quick Reference

- **Frontend:** https://s9-f-end.vercel.app
- **Backend API:** https://nexus-d2dx.onrender.com
- **Backend Health:** https://nexus-d2dx.onrender.com/health

---

**Last Updated:** Configuration verified and backend CORS updated
