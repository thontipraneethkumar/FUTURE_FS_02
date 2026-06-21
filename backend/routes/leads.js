const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const {
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  addNote,
  getAnalytics,
} = require('../controllers/leadController');

// Everything in this router requires a logged-in admin.
router.use(requireAuth);

router.get('/analytics', getAnalytics);
router.get('/', getLeads);
router.get('/:id', getLeadById);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);
router.post('/:id/notes', addNote);

module.exports = router;
