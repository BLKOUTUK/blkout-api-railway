// Chrome Extension Submission Endpoint
// This endpoint receives content submissions from the Chrome extension

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// POST /api/submit - Submit content to moderation queue
router.post('/', async (req, res) => {
  try {
    const {
      title,
      url,
      excerpt,
      category = 'general',
      type = 'story',
      submitted_by = 'chrome_extension',
      content
    } = req.body;

    // Validate required fields
    if (!title || !url) {
      return res.status(400).json({
        success: false,
        error: 'Title and URL are required'
      });
    }

    // Create submission object
    const submission = {
      title,
      url,
      excerpt: excerpt || '',
      category,
      type,
      status: 'pending',
      submitted_by,
      submitted_at: new Date().toISOString(),
      votes: 0,
      content: content || excerpt || ''
    };

    // Insert into moderation queue
    const { data, error } = await supabase
      .from('moderation_queue')
      .insert([submission])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to submit content to moderation queue',
        details: error.message
      });
    }

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Content submitted successfully',
      data,
      liberation_context: 'Community-driven content curation in action'
    });

  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during submission'
    });
  }
});

// GET /api/submit - Health check for submission endpoint
router.get('/', (req, res) => {
  res.json({
    status: 'ready',
    endpoint: '/api/submit',
    method: 'POST',
    purpose: 'Chrome extension content submission',
    required_fields: ['title', 'url'],
    optional_fields: ['excerpt', 'category', 'type', 'submitted_by', 'content']
  });
});

module.exports = router;