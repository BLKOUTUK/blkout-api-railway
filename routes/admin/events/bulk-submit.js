// Admin events bulk submit endpoint
const express = require('express');
const { supabase } = require('../../../lib/supabase');
const router = express.Router();

// POST /api/admin/events/bulk-submit
router.post('/', async (req, res) => {
  try {
    console.log('📦 Processing bulk event submission...');

    const { events, source = 'admin_bulk' } = req.body;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid events data. Expected non-empty array.',
        liberation_message: 'Please provide events to submit'
      });
    }

    // Validate and prepare events for insertion
    const processedEvents = events.map((event, index) => {
      // Basic validation
      if (!event.title) {
        throw new Error(`Event ${index + 1}: title is required`);
      }

      return {
        content_type: 'event',
        status: 'pending',
        source: source,
        metadata: {
          title: event.title,
          description: event.description || '',
          date: event.date || null,
          time: event.time || null,
          location: event.location || 'TBD',
          event_type: event.event_type || 'general',
          url: event.url || null,
          organizer: event.organizer || null,
          capacity: event.capacity || null,
          price: event.price || 'Free',
          tags: event.tags || [],
          accessibility: event.accessibility || {},
          contact: event.contact || {}
        },
        content: JSON.stringify({
          title: event.title,
          description: event.description,
          full_details: event
        }),
        created_at: new Date().toISOString(),
        liberation_context: 'Community-submitted event for democratic curation'
      };
    });

    // Insert into moderation queue
    const { data, error } = await supabase
      .from('moderation_queue')
      .insert(processedEvents)
      .select();

    if (error) {
      console.error('❌ Bulk event submission error:', error);
      throw error;
    }

    console.log(`✅ Successfully submitted ${processedEvents.length} events for moderation`);

    res.json({
      success: true,
      data: data,
      message: `Successfully submitted ${processedEvents.length} events for community review`,
      summary: {
        total_submitted: processedEvents.length,
        status: 'pending_moderation',
        source: source
      },
      liberation_context: 'Events submitted for democratic community curation'
    });

  } catch (error) {
    console.error('❌ Bulk event submission error:', error);

    res.status(400).json({
      success: false,
      error: error.message,
      message: 'Failed to process bulk event submission',
      liberation_message: 'Technical difficulties - community tech collective will address'
    });
  }
});

// GET /api/admin/events/bulk-submit (for template/example)
router.get('/', (req, res) => {
  res.json({
    message: 'Bulk Event Submission API',
    method: 'POST',
    endpoint: '/api/admin/events/bulk-submit',
    required_fields: ['events'],
    optional_fields: ['source'],
    example: {
      events: [
        {
          title: 'Community Liberation Workshop',
          description: 'Building power through collective action',
          date: '2025-10-15',
          time: '18:00',
          location: 'Community Center',
          event_type: 'workshop',
          organizer: 'BLKOUT Liberation Collective',
          price: 'Free',
          tags: ['liberation', 'community', 'workshop']
        }
      ],
      source: 'admin_bulk'
    },
    liberation_context: 'Democratic event curation system'
  });
});

module.exports = router;