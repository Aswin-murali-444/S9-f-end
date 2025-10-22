# Vercel + Render Integration Guide

## Frontend Environment Variables Setup

Create a `.env` file in your `S9-f-end` directory with:

```env
# Production API URL (Render Backend)
VITE_API_URL=https://nexus-d2dx.onrender.com

# Development API URL (Local Backend)
# VITE_API_URL=http://localhost:3001

# Supabase Configuration (if needed for frontend)
VITE_SUPABASE_URL=https://zbscbvrklkntlbtefkgw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpic2NidnJrbGtudGxidGVma2d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODgzOTIsImV4cCI6MjA2ODY2NDM5Mn0.EJbPGMn7kXFgj5IahA2GIiEcA3dTDCbgj9cF09rcsuY
```

## Vercel Environment Variables

In your Vercel dashboard, add these environment variables:

1. **VITE_API_URL**: `https://nexus-d2dx.onrender.com`
2. **VITE_SUPABASE_URL**: `https://zbscbvrklkntlbtefkgw.supabase.co`
3. **VITE_SUPABASE_ANON_KEY**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpic2NidnJrbGtudGxidGVma2d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODgzOTIsImV4cCI6MjA2ODY2NDM5Mn0.EJbPGMn7kXFgj5IahA2GIiEcA3dTDCbgj9cF09rcsuY`

## Backend CORS Configuration

Update your Render backend `index.js` to allow Vercel domain:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'http://127.0.0.1:5173',
    'https://your-vercel-app.vercel.app',  // Add your Vercel URL
    'https://your-custom-domain.com'        // Add your custom domain if any
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
```

## How It Works

### Development Mode:
- Frontend: `http://localhost:5173` (Vite dev server)
- Backend: `http://localhost:3001` (Local Node.js)
- API calls go through Vite proxy (`/api` → `http://localhost:3001`)

### Production Mode:
- Frontend: `https://your-app.vercel.app` (Vercel)
- Backend: `https://nexus-d2dx.onrender.com` (Render)
- API calls go directly to Render backend

## API Service Configuration

Your `api.js` already handles this perfectly:

```javascript
const API_BASE_URL = (() => {
  const envBase = import.meta.env.VITE_API_URL;
  if (envBase) return envBase.replace(/\/$/, '');
  if (typeof window !== 'undefined') {
    const host = window.location?.hostname || '';
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:3001';
    }
  }
  return '/api';
})();
```

This automatically:
- Uses `VITE_API_URL` in production (Vercel)
- Falls back to localhost in development
- Uses `/api` proxy as last resort

## Deployment Steps

### 1. Fix Render Backend First
- Fix the Root Directory issue in Render dashboard
- Ensure backend is running at `https://nexus-d2dx.onrender.com`

### 2. Update Vercel Environment Variables
- Add `VITE_API_URL=https://nexus-d2dx.onrender.com`
- Redeploy your Vercel app

### 3. Test the Connection
- Visit your Vercel app
- Check browser network tab for API calls
- Verify calls go to Render backend

## Benefits of This Setup

✅ **Scalability**: Frontend and backend scale independently  
✅ **Performance**: Vercel's global CDN for frontend  
✅ **Reliability**: Render's robust backend hosting  
✅ **Cost-Effective**: Both platforms have generous free tiers  
✅ **Development**: Easy local development with proxy  

## Troubleshooting

### CORS Issues:
- Update backend CORS to include Vercel domain
- Check browser console for CORS errors

### API Connection Issues:
- Verify `VITE_API_URL` is set correctly in Vercel
- Check Render backend is running
- Test backend URL directly: `https://nexus-d2dx.onrender.com/health`

### Environment Variables:
- Ensure all `VITE_` prefixed variables are set in Vercel
- Redeploy after changing environment variables
