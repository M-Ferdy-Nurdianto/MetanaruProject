const express = require('express');
const router = express.Router();
const multer = require('multer');
const orderController = require('../controllers/orderController');
const { orderLimiter } = require('../middleware/security');

// Multer config for memory storage (upload to Supabase Storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Orders
router.post('/', orderLimiter, orderController.createOrder);
router.get('/', orderController.getAllOrders);

// Image Upload
router.post('/upload-proof', upload.single('proof'), orderController.uploadProof);

// Export
router.get('/export/excel/:eventId', orderController.exportToExcel);
router.get('/export/pdf/:eventId', orderController.exportToPdf);
router.get('/export-merch/excel', orderController.exportMerchToExcel);
router.get('/export-merch/pdf', orderController.exportMerchToPdf);

// Events
router.get('/events', orderController.getAllEvents);
router.post('/events', orderController.addEvent);
router.put('/events/:id', orderController.updateEvent);
router.delete('/events/:id', orderController.deleteEvent);

// Settings
router.get('/settings', orderController.getSettings);
router.put('/settings', orderController.updateSettings);

// Order CRUD by id
router.get('/:id', orderController.getOrderById);
router.put('/:id', orderController.updateOrder);
router.patch('/:id', orderController.updateOrderStatus);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
