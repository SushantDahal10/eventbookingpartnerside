const express = require('express');
const router = express.Router();
const gateStaffController = require('../controllers/gateStaffController');
const requireAuth = require('../middleware/authMiddleware');

// POST /api/gate-staff/request
router.post('/request', requireAuth, gateStaffController.requestGateStaff);

// GET /api/gate-staff/event/:eventId
router.get('/event/:eventId', requireAuth, gateStaffController.getGateStaffRequest);

module.exports = router;
