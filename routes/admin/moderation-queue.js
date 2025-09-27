// Admin moderation queue endpoint
const express = require('express');
const { supabase } = require('../../lib/supabase');
const router = express.Router();

// GET /api/admin/moderation-queue
router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching moderation queue entries...');

    // Extract query parameters
    const { status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase.from('moderation_queue').select('*');

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply pagination and ordering
    query = query
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log(`✅ Retrieved ${data?.length || 0} moderation queue entries`);

    res.json({
      success: true,
      data: data || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        hasMore: data && data.length === parseInt(limit)
      },
      message: data?.length > 0
        ? `Found ${data.length} items in moderation queue`
        : 'No items in moderation queue',
      liberation_context: 'Community-driven content moderation'
    });

  } catch (error) {
    console.error('❌ Moderation queue error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch moderation queue',
      liberation_message: 'Technical difficulties - community tech collective will address'
    });
  }
});

// POST /api/admin/moderation-queue (for bulk operations)
router.post('/', async (req, res) => {
  try {
    const { action, item_ids, new_status } = req.body;

    if (!action || !item_ids || !Array.isArray(item_ids)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: action, item_ids'
      });
    }

    let updateData = {};

    switch (action) {
      case 'approve':
        updateData = { status: 'approved', reviewed_at: new Date().toISOString() };
        break;
      case 'reject':
        updateData = { status: 'rejected', reviewed_at: new Date().toISOString() };
        break;
      case 'update_status':
        if (!new_status) {
          return res.status(400).json({
            success: false,
            error: 'new_status required for update_status action'
          });
        }
        updateData = { status: new_status, reviewed_at: new Date().toISOString() };
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action. Use: approve, reject, update_status'
        });
    }

    const { data, error } = await supabase
      .from('moderation_queue')
      .update(updateData)
      .in('id', item_ids)
      .select();

    if (error) {
      console.error('❌ Bulk update error:', error);
      throw error;
    }

    console.log(`✅ Bulk ${action} completed for ${item_ids.length} items`);

    res.json({
      success: true,
      data,
      message: `Successfully ${action}ed ${item_ids.length} items`,
      liberation_context: 'Democratic content governance in action'
    });

  } catch (error) {
    console.error('❌ Bulk moderation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to perform bulk moderation action'
    });
  }
});

module.exports = router;