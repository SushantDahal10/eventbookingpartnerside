const express = require('express');
const router = express.Router();
const multer = require('multer');
const eventController = require('../controllers/eventController');
const requireAuth = require('../middleware/authMiddleware'); // Ensure partner is logged in

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit per file
});

const uploadFields = upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 3 }
]);

// POST /api/events/create
router.post('/create', requireAuth, uploadFields, eventController.createEvent);

// GET /api/events/my-events
router.get('/my-events', requireAuth, eventController.getMyEvents);

// GET /api/events/:id/analytics
router.get('/:id/analytics', requireAuth, eventController.getEventAnalytics);

module.exports = router;
