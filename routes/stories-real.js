// Stories endpoint (real data from database)
const express = require('express');
const { supabase } = require('../lib/supabase');
const router = express.Router();

// GET /api/stories-real
router.get('/', async (req, res) => {
  try {
    console.log('📖 Fetching real stories from database...');

    const { page = 1, limit = 20, category } = req.query;
    const offset = (page - 1) * limit;

    // Build query for approved stories
    let query = supabase
      .from('moderation_queue')
      .select('*')
      .eq('status', 'approved')
      .eq('type', 'story');

    if (category) {
      query = query.ilike('metadata->>category', `%${category}%`);
    }

    // Apply pagination and ordering
    query = query
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('❌ Stories fetch error:', error);
      throw error;
    }

    // Process stories for frontend
    const stories = data?.map(story => ({
      id: story.id,
      title: story.title || 'Untitled Story',
      excerpt: story.excerpt || '',
      content: story.content,
      author: story.submitted_by || 'Anonymous',
      category: story.category || 'general',
      tags: [],
      published_at: story.reviewed_at || story.submitted_at,
      created_at: story.submitted_at,
      metadata: { title: story.title, excerpt: story.excerpt, category: story.category },
      liberation_context: 'Community story for liberation'
    })) || [];

    console.log(`✅ Retrieved ${stories.length} approved stories`);

    res.json({
      success: true,
      data: stories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: stories.length,
        hasMore: stories.length === parseInt(limit)
      },
      filters: {
        category: category || 'all',
        status: 'approved'
      },
      message: `Retrieved ${stories.length} community stories`,
      liberation_context: 'Real stories from the community, curated democratically'
    });

  } catch (error) {
    console.error('❌ Stories error:', error);

    // Fallback to mock data if database fails
    const mockStories = [
      {
        id: 'mock-1',
        title: 'Liberation Through Technology',
        excerpt: 'How our community is using tech for collective power...',
        author: 'Community Member',
        category: 'technology',
        created_at: new Date().toISOString(),
        liberation_context: 'Mock story - database unavailable'
      }
    ];

    res.status(500).json({
      success: false,
      data: mockStories,
      error: error.message,
      message: 'Database error - showing fallback stories',
      liberation_message: 'Technical difficulties - community tech collective will address'
    });
  }
});

// POST /api/stories-real (submit new story)
router.post('/', async (req, res) => {
  try {
    console.log('✍️ Submitting new story...');

    const {
      title,
      content,
      excerpt,
      author,
      category,
      tags = [],
      metadata = {}
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, content'
      });
    }

    const storyData = {
      title,
      url: null,
      excerpt: excerpt || content.substring(0, 200) + '...',
      category: category || 'general',
      status: 'pending',
      type: 'story',
      submitted_at: new Date().toISOString(),
      submitted_by: author || 'Anonymous',
      moderator_id: null,
      reviewed_at: null,
      votes: 0,
      content
    };

    const { data, error } = await supabase
      .from('moderation_queue')
      .insert([storyData])
      .select()
      .single();

    if (error) {
      console.error('❌ Story submission error:', error);
      throw error;
    }

    console.log(`✅ Story submitted successfully: ${title}`);

    res.json({
      success: true,
      data: {
        id: data.id,
        title: data.title,
        status: data.status,
        created_at: data.submitted_at
      },
      message: 'Story submitted for community review',
      liberation_context: 'Your story will be reviewed by the community for inclusion'
    });

  } catch (error) {
    console.error('❌ Story submission error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to submit story',
      liberation_message: 'Technical difficulties - community tech collective will address'
    });
  }
});

module.exports = router;