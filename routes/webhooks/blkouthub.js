// BLKOUTHUB webhook endpoint
const express = require('express');
const { supabase } = require('../../lib/supabase');
const router = express.Router();

// POST /api/webhooks/blkouthub
router.post('/', async (req, res) => {
  try {
    console.log('🔗 BLKOUTHUB webhook received:', req.headers, req.body);

    // Validate webhook signature if API key is provided
    const apiKey = process.env.BLKOUTHUB_API_KEY;
    if (apiKey) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'Missing or invalid authorization header',
          liberation_message: 'Authentication required for BLKOUTHUB integration'
        });
      }

      const providedKey = authHeader.substring(7); // Remove 'Bearer '
      if (providedKey !== apiKey) {
        return res.status(401).json({
          success: false,
          error: 'Invalid API key',
          liberation_message: 'Unauthorized access attempt'
        });
      }
    }

    const { action, data, timestamp, source = 'blkouthub' } = req.body;

    if (!action || !data) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: action, data'
      });
    }

    // Process different webhook actions
    let processedData;
    let insertData;

    switch (action) {
      case 'content_submit':
        insertData = {
          content_type: data.type || 'article',
          status: 'pending',
          source: source,
          metadata: {
            title: data.title || 'Untitled',
            description: data.description || '',
            url: data.url || null,
            author: data.author || 'BLKOUTHUB',
            external_id: data.id || null,
            webhook_timestamp: timestamp || new Date().toISOString(),
            ...data.metadata || {}
          },
          content: data.content || JSON.stringify(data),
          created_at: new Date().toISOString(),
          liberation_context: 'Content submitted via BLKOUTHUB automation'
        };
        break;

      case 'event_sync':
        insertData = {
          content_type: 'event',
          status: 'pending',
          source: source,
          metadata: {
            title: data.title || 'Untitled Event',
            description: data.description || '',
            date: data.date || null,
            location: data.location || 'TBD',
            event_type: data.event_type || 'general',
            external_id: data.id || null,
            webhook_timestamp: timestamp || new Date().toISOString(),
            ...data.metadata || {}
          },
          content: JSON.stringify(data),
          created_at: new Date().toISOString(),
          liberation_context: 'Event synced via BLKOUTHUB automation'
        };
        break;

      case 'user_action':
        // Log user action but don't insert to moderation queue
        console.log('👤 BLKOUTHUB user action:', data);
        processedData = {
          action: 'user_action_logged',
          user_id: data.user_id,
          action_type: data.action_type,
          timestamp: new Date().toISOString()
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          error: `Unknown action: ${action}`,
          supported_actions: ['content_submit', 'event_sync', 'user_action']
        });
    }

    // Insert to moderation queue if applicable
    if (insertData) {
      const { data: inserted, error } = await supabase
        .from('moderation_queue')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('❌ BLKOUTHUB webhook database error:', error);
        throw error;
      }

      processedData = {
        id: inserted.id,
        action: action,
        status: 'queued_for_moderation',
        title: inserted.metadata.title,
        created_at: inserted.created_at
      };

      console.log(`✅ BLKOUTHUB ${action} processed: ${inserted.metadata.title}`);
    }

    res.json({
      success: true,
      data: processedData,
      message: `BLKOUTHUB ${action} processed successfully`,
      webhook_received: new Date().toISOString(),
      liberation_context: 'Automated liberation through BLKOUTHUB integration'
    });

  } catch (error) {
    console.error('❌ BLKOUTHUB webhook error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to process BLKOUTHUB webhook',
      liberation_message: 'Technical difficulties - community tech collective will address'
    });
  }
});

// GET /api/webhooks/blkouthub (for testing)
router.get('/', (req, res) => {
  res.json({
    message: 'BLKOUTHUB Webhook Endpoint',
    method: 'POST',
    endpoint: '/api/webhooks/blkouthub',
    required_headers: ['Authorization: Bearer <api_key>'],
    supported_actions: ['content_submit', 'event_sync', 'user_action'],
    example_payload: {
      action: 'content_submit',
      data: {
        title: 'Liberation Article',
        content: 'Content here...',
        type: 'article',
        author: 'Community Member'
      },
      timestamp: new Date().toISOString(),
      source: 'blkouthub'
    },
    liberation_context: 'Automated content flow from BLKOUTHUB to community platform'
  });
});

module.exports = router;