// Content routes for general platform content
const express = require('express');
const { supabase } = require('../lib/supabase');
const router = express.Router();

// GET /api/content
router.get('/', async (req, res) => {
  try {
    console.log('📄 Fetching platform content...');

    const { type, status = 'approved', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('moderation_queue')
      .select('*')
      .eq('status', status);

    if (type) {
      query = query.eq('type', type);
    }

    // Apply pagination and ordering
    query = query
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('❌ Content fetch error:', error);
      throw error;
    }

    // Process content for frontend consumption
    const processedContent = data?.map(item => ({
      id: item.id,
      type: item.type,
      title: item.title || 'Untitled',
      description: item.excerpt || '',
      content: item.content,
      status: item.status,
      created_at: item.submitted_at,
      metadata: { title: item.title, excerpt: item.excerpt, category: item.category },
      liberation_context: 'Community-curated content'
    })) || [];

    console.log(`✅ Retrieved ${processedContent.length} content items`);

    res.json({
      success: true,
      data: processedContent,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: processedContent.length,
        hasMore: processedContent.length === parseInt(limit)
      },
      filters: {
        type: type || 'all',
        status: status
      },
      message: `Retrieved ${processedContent.length} content items`,
      liberation_context: 'Community-owned platform content'
    });

  } catch (error) {
    console.error('❌ Content error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch content',
      liberation_message: 'Technical difficulties - community tech collective will address'
    });
  }
});

// POST /api/content (submit new content)
router.post('/', async (req, res) => {
  try {
    console.log('📝 Submitting new content...');

    const {
      type,
      title,
      excerpt,
      content,
      category = 'general',
      submitted_by = 'platform_user'
    } = req.body;

    if (!type || !title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type, title, content'
      });
    }

    const contentData = {
      title,
      url: null,
      excerpt: excerpt || content.substring(0, 200) + '...',
      category,
      status: 'pending',
      type,
      submitted_at: new Date().toISOString(),
      submitted_by,
      moderator_id: null,
      reviewed_at: null,
      votes: 0,
      content: typeof content === 'string' ? content : JSON.stringify(content)
    };

    const { data, error } = await supabase
      .from('moderation_queue')
      .insert([contentData])
      .select()
      .single();

    if (error) {
      console.error('❌ Content submission error:', error);
      throw error;
    }

    console.log(`✅ Content submitted successfully: ${title}`);

    res.json({
      success: true,
      data: {
        id: data.id,
        title: data.title,
        status: data.status,
        type: data.type,
        created_at: data.submitted_at
      },
      message: 'Content submitted for community review',
      liberation_context: 'Your contribution will be reviewed by the community'
    });

  } catch (error) {
    console.error('❌ Content submission error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to submit content',
      liberation_message: 'Technical difficulties - community tech collective will address'
    });
  }
});

module.exports = router;