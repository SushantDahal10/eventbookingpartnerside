const express = require('express');
const router = express.Router();
const multer = require('multer');
const authController = require('../controllers/authController');

// Multer setup for memory storage (files accessed via req.file.buffer)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Fields to accept
const uploadFields = upload.fields([
    { name: 'panPhoto', maxCount: 1 },
    { name: 'vatPhoto', maxCount: 1 }
]);

const requireAuth = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/adminMiddleware');

// Public
router.post('/register', uploadFields, authController.registerPartner);
router.post('/resubmit', uploadFields, authController.resubmitPartner);
router.get('/application-data', authController.getApplicationData);
router.post('/login', authController.loginPartner);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOtp);

// Admin Routes (Protected)
router.get('/admin/pending', requireAdmin, authController.getPendingPartners);
router.post('/admin/approve', requireAdmin, authController.approvePartner);
router.post('/admin/reject', requireAdmin, authController.rejectPartner);
router.post('/admin/generate-resubmit-link', requireAdmin, authController.generateResubmissionLink);
router.post('/send-password-otp', authController.sendPasswordOtp);
router.post('/verify-change-password', authController.verifyChangePassword);
router.post('/update-password', requireAuth, authController.updatePassword);
router.post('/setup-password', authController.setupPassword);
router.post('/logout', authController.logout);

module.exports = router;
