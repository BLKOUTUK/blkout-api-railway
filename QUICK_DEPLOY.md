# 🚀 RAILWAY DEPLOYMENT - CORRECTED COMMANDS

## **CORRECT Railway CLI Syntax (Each variable separately):**

```bash
# 1. Navigate to Railway backend directory
cd /home/robbe/ACTIVE_PROJECTS/BLKOUT_LIBERATION_PLATFORM/blkout-api-railway

# 2. Initialize Railway project
railway login
railway init blkout-api

# 3. Set environment variables (ONE BY ONE - CORRECT SYNTAX)
railway variables --set "PORT=3001"
railway variables --set "NODE_ENV=production"
railway variables --set "SUPABASE_URL=https://bgjengudzfickgomjqmz.supabase.co"
railway variables --set "SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnamVuZ3VkemZpY2tnb21qcW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MTI3NjcsImV4cCI6MjA3MTE4ODc2N30.kYQ2oFuQBGmu4V_dnj_1zDMDVsd-qpDZJwNvswzO6M0"
railway variables --set "CORS_ORIGIN=https://blkout-community-platform.vercel.app"

# 4. Deploy Railway backend
railway up

# 5. Get your Railway URL
railway domain

# 6. Test deployment
curl https://[your-railway-domain]/health

# 7. Update frontend environment
cd ../blkout-community-platform
vercel env add VITE_API_URL production
# Enter: https://[your-railway-domain]/api

# 8. Redeploy frontend
vercel --prod
```

## **Alternative: Use .env file (if Railway CLI is problematic)**

```bash
# Option B: Use environment file upload
cd /home/robbe/ACTIVE_PROJECTS/BLKOUT_LIBERATION_PLATFORM/blkout-api-railway

# Create production .env
cat > .env.production << 'EOF'
PORT=3001
NODE_ENV=production
SUPABASE_URL=https://bgjengudzfickgomjqmz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnamVuZ3VkemZpY2tnb21qcW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MTI3NjcsImV4cCI6MjA3MTE4ODc2N30.kYQ2oFuQBGmu4V_dnj_1zDMDVsd-qpDZJwNvswzO6M0
CORS_ORIGIN=https://blkout-community-platform.vercel.app
EOF

# Deploy with environment file
railway login
railway init blkout-api
railway up
```

## **Expected Results After Deployment:**

✅ **Health Check**: `{"status":"healthy","service":"blkout-api-railway"}`
✅ **Moderation Queue**: Real Chrome extension submissions (not mock data)
✅ **Stats Endpoint**: `"total_submissions":7` from real database
✅ **Events Queue**: Real events data
✅ **No CORS Errors**: Frontend connects successfully to Railway

## **Quick Test Commands:**

```bash
# Replace [domain] with your Railway domain
curl https://[domain]/health
curl https://[domain]/api/admin/moderation-queue?limit=1
curl https://[domain]/api/admin/stats
curl https://[domain]/api/admin/events/moderation-queue
```

## **Success Indicators:**

- Railway deployment shows "✅ Deployment successful"
- Health endpoint returns healthy status
- Admin dashboard loads real data (no mock fallbacks)
- Chrome extension submissions appear in admin interface
- Browser console shows no CORS errors

Your Railway backend is ready - use whichever method works best! 🚀