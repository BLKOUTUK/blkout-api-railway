// Admin routes router
const express = require('express');
const router = express.Router();

// Import sub-routes
const moderationQueue = require('./admin/moderation-queue');
const stats = require('./admin/stats');
const events = require('./admin/events');

// Mount sub-routes
router.use('/moderation-queue', moderationQueue);
router.use('/stats', stats);
router.use('/events', events);

// Admin overview
router.get('/', (req, res) => {
  res.json({
    message: 'BLKOUT Liberation Platform - Admin API',
    endpoints: {
      moderation_queue: '/api/admin/moderation-queue',
      stats: '/api/admin/stats',
      events: '/api/admin/events/*'
    },
    liberation: {
      democraticGovernance: true,
      communityOwned: true
    }
  });
});

module.exports = router;