# 🚨 RAILWAY 502 ERROR - DEBUG GUIDE

## Error Analysis
Your Railway deployment is returning:
```json
{"status":"error","code":502,"message":"Application failed to respond","request_id":"ejbeY-X4Sjy8xVg8ss7a6g"}
```

This indicates Railway deployed the app but it's not responding properly. Common causes:

## 🔍 TROUBLESHOOTING CHECKLIST

### 1. Check Railway Environment Variables
Ensure these are set in Railway Dashboard → Variables:
```
PORT=3001
NODE_ENV=production
SUPABASE_URL=https://bgjengudzfickgomjqmz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnamVuZ3VkemZpY2tnb21qcW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MTI3NjcsImV4cCI6MjA3MTE4ODc2N30.kYQ2oFuQBGmu4V_dnj_1zDMDVsd-qpDZJwNvswzO6M0
CORS_ORIGIN=https://blkout-community-platform.vercel.app
```

### 2. Check Railway Logs
In Railway Dashboard → Deployments → View Logs, look for:
- ❌ `Error: Cannot find module` - missing dependencies
- ❌ `EADDRINUSE` - port conflict
- ❌ `Connection refused` - database connection issues
- ❌ `SyntaxError` - code errors

### 3. Common Railway Fixes

#### Fix A: Port Binding Issue
Railway might be using a different port. Create `Procfile`:
```
web: node server.js
```

#### Fix B: Start Command Issue
In Railway Dashboard → Settings → Start Command:
```
npm start
```

#### Fix C: Build Command Issue
In Railway Dashboard → Settings → Build Command:
```
npm install
```

### 4. Quick Fix Deployment

If variables are correct, try redeploying:
1. Railway Dashboard → Deployments
2. Click "Redeploy" on latest deployment
3. Watch build logs for errors

### 5. Alternative Port Configuration

Update `server.js` line 13 to be more Railway-friendly:
```javascript
const PORT = process.env.PORT || process.env.RAILWAY_PORT || 3001;
```

## 🚀 IMMEDIATE ACTION STEPS

1. **Check Railway Dashboard Variables** (most likely cause)
2. **Review Railway Deployment Logs**
3. **Redeploy if variables were missing**
4. **Test health endpoint again**

## 🔄 Rollback Plan

If Railway continues failing:
1. Keep Railway project for debugging
2. Temporarily revert frontend to local API routes:
   ```bash
   vercel env add VITE_API_URL production
   # Enter: /api
   vercel --prod
   ```

## ✅ Success Indicator

When fixed, health endpoint should return:
```json
{"status":"healthy","service":"blkout-api-railway"}
```

**Most common cause**: Missing environment variables in Railway Dashboard