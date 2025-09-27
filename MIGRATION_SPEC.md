# BLKOUT Platform Hybrid Migration Specification
## Railway Backend + Vercel Frontend Architecture

### 🎯 Migration Objectives
- **Solve:** Function limits, database connectivity issues, 404/500 errors
- **Improve:** Performance, scalability, debugging capabilities
- **Reduce:** Operational costs by 75% ($20/month → $5/month)
- **Maintain:** Zero downtime during migration

### 📊 Swarm Status
- **Swarm ID:** swarm_1758931441214_z9apfg02r
- **Topology:** Mesh (peer-to-peer coordination)
- **Active Agents:** 5 specialized agents

#### Agent Roster:
1. **Railway-Backend-Architect** (agent_1758931460068_fcscv2)
   - Role: Design Express.js backend structure
   - Status: Active

2. **Express-API-Developer** (agent_1758931460187_2h3iqp)
   - Role: Convert serverless functions to Express routes
   - Status: Active

3. **Database-Migration-Specialist** (agent_1758931460306_38ddzj)
   - Role: Configure Supabase persistent connections
   - Status: Active

4. **Frontend-Integration-Monitor** (agent_1758931460437_rsh46b)
   - Role: Validate API integration and CORS
   - Status: Active

5. **DevOps-Deployment-Coordinator** (agent_1758931460568_l7iwx5)
   - Role: Handle Railway deployment and DNS
   - Status: Active

### 🏗️ Architecture Blueprint

```
┌────────────────────────────────────────────────────────────┐
│                     Current Architecture                    │
├────────────────────────────────────────────────────────────┤
│  Vercel Monolith                                          │
│  ├── Frontend (React/Next.js)                             │
│  └── API (Serverless Functions)                           │
│      ├── /api/admin/moderation-queue ✅                   │
│      ├── /api/admin/events/moderation-queue ❌ (404)      │
│      ├── /api/admin/stats ❌ (500)                        │
│      └── 5 other endpoints ✅                             │
└────────────────────────────────────────────────────────────┘
                            ⬇️
┌────────────────────────────────────────────────────────────┐
│                    Target Architecture                      │
├────────────────────────────────────────────────────────────┤
│  Vercel Frontend                Railway Backend            │
│  ├── React Build               ├── Express Server          │
│  ├── Static Assets              ├── All API Routes         │
│  └── CDN Delivery               └── Persistent DB Pool     │
└────────────────────────────────────────────────────────────┘
```

### 📁 Railway Project Structure

```
blkout-api-railway/
├── package.json              # Dependencies and scripts
├── railway.json             # Railway configuration
├── server.js               # Express entry point
├── .env.example           # Environment template
├── lib/
│   └── supabase.js       # Database client with pooling
├── middleware/
│   ├── cors.js          # CORS configuration
│   └── auth.js          # Authentication middleware
├── routes/
│   ├── admin/
│   │   ├── moderation-queue.js
│   │   ├── stats.js
│   │   └── events/
│   │       ├── moderation-queue.js
│   │       └── bulk-submit.js
│   ├── content.js
│   ├── health.js
│   ├── stories-real.js
│   └── webhooks/
│       ├── blkouthub.js
│       └── n8n.js
└── utils/
    └── logger.js         # Centralized logging
```

### 🔄 Migration Tasks

#### Phase 1: Infrastructure Setup (15 minutes)
- [ ] Create Railway project
- [ ] Configure environment variables
- [ ] Set up GitHub integration
- [ ] Initialize Express server

#### Phase 2: API Migration (30 minutes)
- [ ] Convert serverless functions to Express routes
- [ ] Fix `/api/admin/stats` dependency issue
- [ ] Create missing `/api/admin/events/moderation-queue`
- [ ] Configure database connection pooling

#### Phase 3: Frontend Integration (10 minutes)
- [ ] Update API base URL in community-api.ts
- [ ] Configure CORS for production domain
- [ ] Update environment variables in Vercel

#### Phase 4: Deployment & Testing (5 minutes)
- [ ] Deploy Railway backend
- [ ] Update Vercel frontend
- [ ] Test all endpoints
- [ ] Verify Chrome extension flow

### 🔑 Environment Variables

```bash
# Railway Backend (.env)
PORT=3001
NODE_ENV=production
SUPABASE_URL=https://bgjengudzfickgomjqmz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
CORS_ORIGIN=https://blkout-community-platform.vercel.app
N8N_WEBHOOK_SECRET=<if-needed>
BLKOUTHUB_API_KEY=<if-needed>

# Vercel Frontend (.env.production)
VITE_API_URL=https://blkout-api.railway.app
VITE_SUPABASE_URL=https://bgjengudzfickgomjqmz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 📊 Success Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| API Endpoints Working | 6/8 (75%) | 8/8 (100%) | 🔄 |
| Response Time | 200-500ms | <100ms | 🔄 |
| Monthly Cost | $20 | $5 | 🔄 |
| Function Limits | 8/12 | Unlimited | 🔄 |
| Database Connections | Ephemeral | Persistent | 🔄 |

### 🚀 Deployment Commands

```bash
# Railway Backend
railway login
railway init blkout-api
railway up
railway domain

# Vercel Frontend
vercel env add VITE_API_URL production
vercel --prod

# Testing
curl https://blkout-api.railway.app/health
curl https://blkout-api.railway.app/api/admin/moderation-queue
```

### 📝 Rollback Plan

If issues occur:
1. Revert Vercel frontend to use `/api` routes
2. Railway backend remains active (no impact)
3. DNS changes not required (using Railway subdomain)
4. Total rollback time: <2 minutes

### ✅ Completion Checklist

- [ ] All 8 API endpoints functional
- [ ] Admin dashboard shows real data (no mock fallback)
- [ ] Chrome extension submissions working
- [ ] Database connections stable
- [ ] CORS properly configured
- [ ] Monitoring and logs accessible
- [ ] Documentation updated

---

**Migration Started:** 2025-09-27T00:04:01Z
**Swarm Deployed:** 5 specialized agents active
**Target Completion:** 1 hour
**Risk Level:** Low (frontend unchanged)