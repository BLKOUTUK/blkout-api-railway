// N8N webhook endpoint
const express = require('express');
const { supabase } = require('../../lib/supabase');
const router = express.Router();

// POST /api/webhooks/n8n
router.post('/', async (req, res) => {
  try {
    console.log('🔧 N8N webhook received:', req.headers, req.body);

    // Optional webhook secret validation
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET;
    if (webhookSecret) {
      const providedSecret = req.headers['x-n8n-webhook-secret'] || req.body.webhook_secret;
      if (providedSecret !== webhookSecret) {
        return res.status(401).json({
          success: false,
          error: 'Invalid webhook secret',
          liberation_message: 'Unauthorized N8N webhook attempt'
        });
      }
    }

    const { workflow, execution_id, data, timestamp } = req.body;

    if (!workflow || !data) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: workflow, data'
      });
    }

    // Process different N8N workflows
    let processedData;
    let insertData;

    switch (workflow) {
      case 'social_media_monitoring':
        insertData = {
          content_type: 'social_post',
          status: 'pending',
          source: 'n8n_social_monitoring',
          metadata: {
            title: data.post_title || `Social post from ${data.platform || 'unknown'}`,
            description: data.post_content || '',
            platform: data.platform || 'unknown',
            author: data.author || 'Anonymous',
            post_url: data.url || null,
            engagement: data.engagement || {},
            execution_id: execution_id,
            workflow_timestamp: timestamp || new Date().toISOString(),
            ...data.metadata || {}
          },
          content: data.post_content || JSON.stringify(data),
          created_at: new Date().toISOString(),
          liberation_context: 'Social media content captured via N8N automation'
        };
        break;

      case 'content_aggregation':
        insertData = {
          content_type: data.content_type || 'article',
          status: 'pending',
          source: 'n8n_aggregation',
          metadata: {
            title: data.title || 'Aggregated Content',
            description: data.description || '',
            source_url: data.source_url || null,
            author: data.author || 'External Source',
            aggregation_date: timestamp || new Date().toISOString(),
            execution_id: execution_id,
            ...data.metadata || {}
          },
          content: data.content || JSON.stringify(data),
          created_at: new Date().toISOString(),
          liberation_context: 'Content aggregated via N8N automation'
        };
        break;

      case 'event_sync':
        insertData = {
          content_type: 'event',
          status: 'pending',
          source: 'n8n_event_sync',
          metadata: {
            title: data.title || 'N8N Synced Event',
            description: data.description || '',
            date: data.date || null,
            location: data.location || 'TBD',
            event_type: data.event_type || 'general',
            source_platform: data.source_platform || 'unknown',
            execution_id: execution_id,
            sync_timestamp: timestamp || new Date().toISOString(),
            ...data.metadata || {}
          },
          content: JSON.stringify(data),
          created_at: new Date().toISOString(),
          liberation_context: 'Event synced via N8N automation'
        };
        break;

      case 'notification_trigger':
        // Process notification but don't store in moderation queue
        console.log('🔔 N8N notification trigger:', data);
        processedData = {
          workflow: 'notification_trigger',
          notification_type: data.type,
          message: data.message,
          processed_at: new Date().toISOString(),
          execution_id: execution_id
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          error: `Unknown N8N workflow: ${workflow}`,
          supported_workflows: [
            'social_media_monitoring',
            'content_aggregation',
            'event_sync',
            'notification_trigger'
          ]
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
        console.error('❌ N8N webhook database error:', error);
        throw error;
      }

      processedData = {
        id: inserted.id,
        workflow: workflow,
        status: 'queued_for_moderation',
        title: inserted.metadata.title,
        execution_id: execution_id,
        created_at: inserted.created_at
      };

      console.log(`✅ N8N ${workflow} processed: ${inserted.metadata.title}`);
    }

    res.json({
      success: true,
      data: processedData,
      message: `N8N workflow '${workflow}' processed successfully`,
      webhook_received: new Date().toISOString(),
      liberation_context: 'Automated liberation through N8N workflow orchestration'
    });

  } catch (error) {
    console.error('❌ N8N webhook error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to process N8N webhook',
      liberation_message: 'Technical difficulties - community tech collective will address'
    });
  }
});

// GET /api/webhooks/n8n (for testing and documentation)
router.get('/', (req, res) => {
  res.json({
    message: 'N8N Webhook Endpoint',
    method: 'POST',
    endpoint: '/api/webhooks/n8n',
    optional_headers: ['x-n8n-webhook-secret'],
    supported_workflows: [
      'social_media_monitoring',
      'content_aggregation',
      'event_sync',
      'notification_trigger'
    ],
    example_payload: {
      workflow: 'content_aggregation',
      execution_id: 'exec_123456',
      data: {
        title: 'Liberation News Article',
        content: 'Article content...',
        content_type: 'article',
        author: 'News Source',
        source_url: 'https://example.com/article'
      },
      timestamp: new Date().toISOString()
    },
    liberation_context: 'Automated content workflows via N8N integration'
  });
});

module.exports = router;