const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const requireAuth = require('../middleware/authMiddleware');

// GET /api/partners/dashboard
router.get('/dashboard', requireAuth, partnerController.getDashboardStats);

// Profile Management
router.get('/profile', requireAuth, partnerController.getProfile);
router.put('/profile/update', requireAuth, partnerController.updateProfile);

// Earnings & Payouts
router.get('/earnings', requireAuth, partnerController.getEarnings);
router.post('/payouts/initiate', requireAuth, partnerController.initiatePayout);
router.post('/payouts/confirm', requireAuth, partnerController.confirmPayout);
router.get('/payouts/history', requireAuth, partnerController.getPayoutHistory);

module.exports = router;
