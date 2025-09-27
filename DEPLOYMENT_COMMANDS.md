# 🚀 BLKOUT Railway Deployment Commands

## Phase 1: Railway Backend Deployment (5 minutes)

### Step 1: Initialize Railway Project
```bash
# Navigate to Railway backend directory
cd /home/robbe/ACTIVE_PROJECTS/BLKOUT_LIBERATION_PLATFORM/blkout-api-railway

# Login to Railway (if not already logged in)
railway login

# Create new Railway project
railway init

# Link to existing project (if you have one) OR create new
# railway link [project-id]  # Use this if you have existing project
# OR
# railway init blkout-api  # Use this to create new project
```

### Step 2: Set Environment Variables
```bash
# Set production environment variables (correct Railway CLI syntax)
railway variables --set "PORT=3001" --set "NODE_ENV=production" --set "SUPABASE_URL=https://bgjengudzfickgomjqmz.supabase.co" --set "SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnamVuZ3VkemZpY2tnb21qcW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MTI3NjcsImV4cCI6MjA3MTE4ODc2N30.kYQ2oFuQBGmu4V_dnj_1zDMDVsd-qpDZJwNvswzO6M0" --set "CORS_ORIGIN=https://blkout-community-platform.vercel.app"

# Set liberation platform values
railway variables --set "PLATFORM_NAME=BLKOUT Liberation Platform" --set "COMMUNITY_GOVERNANCE=true" --set "DEMOCRATIC_MODERATION=true" --set "CREATOR_SOVEREIGNTY=true"
```

### Step 3: Deploy Railway Backend
```bash
# Deploy to Railway
railway up

# Get your Railway deployment URL
railway domain

# Test deployment
curl https://[your-railway-domain]/health
```

## Phase 2: Vercel Frontend Update (2 minutes)

### Step 4: Update Frontend Environment Variables
```bash
# Navigate to frontend directory
cd /home/robbe/ACTIVE_PROJECTS/BLKOUT_LIBERATION_PLATFORM/blkout-community-platform

# Update production environment variable to use your Railway URL
# Replace [your-railway-domain] with the actual Railway domain from step 3
vercel env add VITE_API_URL production
# Enter: https://[your-railway-domain]/api

# Redeploy frontend with new backend URL
vercel --prod
```

## Phase 3: Verification (3 minutes)

### Step 5: Test Complete Flow
```bash
# Test all critical endpoints
curl https://[your-railway-domain]/health
curl https://[your-railway-domain]/api/admin/moderation-queue?limit=2
curl https://[your-railway-domain]/api/admin/stats
curl https://[your-railway-domain]/api/admin/events/moderation-queue

# Test CORS from frontend
# Visit: https://blkout-community-platform.vercel.app/admin
# Verify: Real data loads without CORS errors
```

## Expected Results ✅

After deployment, you should see:

1. **Railway Backend Health**: `{"status":"healthy","service":"blkout-api-railway"}`
2. **Real Moderation Queue**: Chrome extension submissions visible
3. **Working Stats**: Real database statistics (not mock data)
4. **Events Queue**: Real events data
5. **No CORS Errors**: Frontend connects to Railway backend
6. **Admin Dashboard**: Shows real data, not fallbacks

## Rollback Plan 🔄

If issues occur:
```bash
# Revert frontend to local API routes
vercel env add VITE_API_URL production
# Enter: /api

# Redeploy frontend
vercel --prod

# Railway backend remains active (no impact)
# Total rollback time: <2 minutes
```

## Railway Project Settings

Ensure these settings in Railway dashboard:
- **Start Command**: `npm start`
- **Health Check Path**: `/health`
- **Port**: `3001` (auto-detected)
- **Domain**: Custom domain if needed

## Liberation Values Maintained ✊

- ✅ Democratic Governance: Community-driven moderation preserved
- ✅ Creator Sovereignty: 75% revenue sharing maintained
- ✅ Trauma-Informed: Gentle error handling and fallbacks included
- ✅ Community Owned: All liberation context preserved in responses

---

**Deployment Time**: ~10 minutes total
**Cost Reduction**: $20/month → $5/month (75% savings)
**Function Limits**: Eliminated (Vercel 12 → Railway unlimited)
**Performance**: <100ms response times expected