// Admin stats endpoint (fixed without liberationDB dependency)
const express = require('express');
const { supabase } = require('../../lib/supabase');
const router = express.Router();

// GET /api/admin/stats
router.get('/', async (req, res) => {
  try {
    console.log('📊 Fetching admin statistics...');

    // Parallel database queries for efficiency
    const [
      moderationStats,
      recentSubmissions,
      statusDistribution
    ] = await Promise.all([
      // Total moderation queue stats
      supabase
        .from('moderation_queue')
        .select('status', { count: 'exact' }),

      // Recent submissions (last 7 days)
      supabase
        .from('moderation_queue')
        .select('created_at, status')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false }),

      // Status distribution
      supabase
        .rpc('get_moderation_status_counts')
        .then(result => result.data || [])
        .catch(() => {
          // Fallback if RPC doesn't exist
          return supabase
            .from('moderation_queue')
            .select('status')
            .then(({ data }) => {
              const counts = {};
              data?.forEach(item => {
                counts[item.status] = (counts[item.status] || 0) + 1;
              });
              return Object.entries(counts).map(([status, count]) => ({ status, count }));
            });
        })
    ]);

    // Process results
    const totalItems = moderationStats.count || 0;
    const recentCount = recentSubmissions.data?.length || 0;

    // Calculate status breakdown
    const statusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      flagged: 0
    };

    if (Array.isArray(statusDistribution)) {
      statusDistribution.forEach(item => {
        if (statusCounts.hasOwnProperty(item.status)) {
          statusCounts[item.status] = item.count;
        }
      });
    }

    // Calculate trends (simplified)
    const approvalRate = totalItems > 0
      ? ((statusCounts.approved / totalItems) * 100).toFixed(1)
      : 0;

    const stats = {
      overview: {
        total_submissions: totalItems,
        recent_submissions: recentCount,
        approval_rate: `${approvalRate}%`,
        pending_review: statusCounts.pending
      },
      status_breakdown: statusCounts,
      recent_activity: {
        last_7_days: recentCount,
        daily_average: totalItems > 0 ? Math.round(recentCount / 7) : 0
      },
      health: {
        database_connected: true,
        last_updated: new Date().toISOString(),
        system_status: 'operational'
      },
      liberation_metrics: {
        community_governance: true,
        democratic_moderation: true,
        transparent_process: true
      }
    };

    console.log(`✅ Stats compiled: ${totalItems} total items, ${recentCount} recent`);

    res.json({
      success: true,
      data: stats,
      message: 'Admin statistics retrieved successfully',
      liberation_context: 'Transparent community governance metrics'
    });

  } catch (error) {
    console.error('❌ Stats error:', error);

    // Fallback stats if database fails
    const fallbackStats = {
      overview: {
        total_submissions: 0,
        recent_submissions: 0,
        approval_rate: '0%',
        pending_review: 0
      },
      status_breakdown: {
        pending: 0,
        approved: 0,
        rejected: 0,
        flagged: 0
      },
      recent_activity: {
        last_7_days: 0,
        daily_average: 0
      },
      health: {
        database_connected: false,
        last_updated: new Date().toISOString(),
        system_status: 'degraded',
        error: error.message
      },
      liberation_metrics: {
        community_governance: true,
        democratic_moderation: true,
        transparent_process: true
      }
    };

    res.status(500).json({
      success: false,
      data: fallbackStats,
      error: error.message,
      message: 'Failed to fetch complete stats - showing fallback data',
      liberation_message: 'Technical difficulties - community tech collective will address'
    });
  }
});

module.exports = router;