// Admin events routes
const express = require('express');
const router = express.Router();

// Import event sub-routes
const moderationQueue = require('./events/moderation-queue');
const bulkSubmit = require('./events/bulk-submit');

// Mount sub-routes
router.use('/moderation-queue', moderationQueue);
router.use('/bulk-submit', bulkSubmit);

// Events admin overview
router.get('/', (req, res) => {
  res.json({
    message: 'BLKOUT Liberation Platform - Events Admin API',
    endpoints: {
      events_moderation: '/api/admin/events/moderation-queue',
      bulk_submit: '/api/admin/events/bulk-submit'
    },
    liberation: {
      communityEvents: true,
      democraticCuration: true
    }
  });
});

module.exports = router;