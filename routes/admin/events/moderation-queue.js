// Admin events moderation queue endpoint (MISSING ENDPOINT FIX)
const express = require('express');
const { supabase } = require('../../../lib/supabase');
const router = express.Router();

// GET /api/admin/events/moderation-queue
router.get('/', async (req, res) => {
  try {
    console.log('📅 Fetching events moderation queue...');

    // Extract query parameters
    const { status, page = 1, limit = 50, event_type } = req.query;
    const offset = (page - 1) * limit;

    // Build query for events in moderation queue
    let query = supabase
      .from('moderation_queue')
      .select('*')
      .eq('type', 'event'); // Filter for events only

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (event_type) {
      query = query.ilike('metadata->>event_type', `%${event_type}%`);
    }

    // Apply pagination and ordering
    query = query
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('❌ Events moderation queue error:', error);
      throw error;
    }

    // Process and enrich event data
    const enrichedData = data?.map(item => ({
      ...item,
      event_details: {
        title: item.title || 'Untitled Event',
        date: item.submitted_at || null,
        location: 'TBD',
        event_type: item.category || 'general',
        description: item.excerpt || ''
      }
    })) || [];

    console.log(`✅ Retrieved ${enrichedData.length} events from moderation queue`);

    res.json({
      success: true,
      data: enrichedData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: enrichedData.length,
        hasMore: enrichedData.length === parseInt(limit)
      },
      filters: {
        status: status || 'all',
        event_type: event_type || 'all'
      },
      message: enrichedData.length > 0
        ? `Found ${enrichedData.length} events in moderation queue`
        : 'No events in moderation queue',
      liberation_context: 'Community-curated events for liberation'
    });

  } catch (error) {
    console.error('❌ Events moderation queue error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch events moderation queue',
      liberation_message: 'Technical difficulties - community tech collective will address'
    });
  }
});

// POST /api/admin/events/moderation-queue (for bulk operations)
router.post('/', async (req, res) => {
  try {
    const { action, event_ids, new_status } = req.body;

    if (!action || !event_ids || !Array.isArray(event_ids)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: action, event_ids'
      });
    }

    let updateData = { reviewed_at: new Date().toISOString() };

    switch (action) {
      case 'approve':
        updateData.status = 'approved';
        break;
      case 'reject':
        updateData.status = 'rejected';
        break;
      case 'feature':
        updateData.status = 'approved';
        // Note: featured flag would need to be added to schema if needed
        break;
      case 'update_status':
        if (!new_status) {
          return res.status(400).json({
            success: false,
            error: 'new_status required for update_status action'
          });
        }
        updateData.status = new_status;
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action. Use: approve, reject, feature, update_status'
        });
    }

    // Update only events in moderation queue
    const { data, error } = await supabase
      .from('moderation_queue')
      .update(updateData)
      .in('id', event_ids)
      .eq('type', 'event')
      .select();

    if (error) {
      console.error('❌ Events bulk update error:', error);
      throw error;
    }

    console.log(`✅ Events bulk ${action} completed for ${event_ids.length} items`);

    res.json({
      success: true,
      data,
      message: `Successfully ${action}ed ${event_ids.length} events`,
      liberation_context: 'Democratic event curation in action'
    });

  } catch (error) {
    console.error('❌ Events bulk moderation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to perform bulk event moderation action'
    });
  }
});

module.exports = router;