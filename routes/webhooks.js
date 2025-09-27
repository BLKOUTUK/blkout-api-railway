// Webhooks router
const express = require('express');
const router = express.Router();

// Import webhook endpoints
const blkouthub = require('./webhooks/blkouthub');
const n8n = require('./webhooks/n8n');

// Mount webhook routes
router.use('/blkouthub', blkouthub);
router.use('/n8n', n8n);

// Webhooks overview
router.get('/', (req, res) => {
  res.json({
    message: 'BLKOUT Liberation Platform - Webhooks API',
    endpoints: {
      blkouthub: '/api/webhooks/blkouthub',
      n8n: '/api/webhooks/n8n',
      heartbeat: '/api/webhooks/heartbeat'
    },
    liberation: {
      automatedLiberation: true,
      communityIntegration: true
    }
  });
});

// Heartbeat endpoint for monitoring
router.get('/heartbeat', (req, res) => {
  res.json({
    status: 'alive',
    service: 'blkout-webhooks',
    timestamp: new Date().toISOString(),
    liberation: 'pulsing strong'
  });
});

router.post('/heartbeat', (req, res) => {
  res.json({
    status: 'received',
    service: 'blkout-webhooks',
    timestamp: new Date().toISOString(),
    data: req.body,
    liberation: 'heartbeat acknowledged'
  });
});

module.exports = router;