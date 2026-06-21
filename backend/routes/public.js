const express = require('express');
const router = express.Router();
const { createLead } = require('../controllers/leadController');

// This is the endpoint your actual website's contact form should POST to.
// e.g. fetch('http://your-api.com/api/public/leads', { method: 'POST', body: {...} })
router.post('/leads', createLead);

module.exports = router;
