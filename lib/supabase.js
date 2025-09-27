// Supabase client with persistent connection pooling
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

// Create client with enhanced options for Railway deployment
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // Server-side doesn't need session persistence
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Liberation-Platform': 'BLKOUT-Railway-Backend'
    }
  }
});

// Test connection on startup
async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('moderation_queue')
      .select('count', { count: 'exact', head: true });

    if (error) throw error;
    console.log('✅ Database connection established');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

module.exports = { supabase, testConnection };