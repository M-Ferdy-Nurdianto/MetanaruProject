const express = require('express');
const router = express.Router();
const multer = require('multer');
const apiController = require('../controllers/apiController');
const postEventController = require('../controllers/postEventController');

// Multer config for memory storage
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

// Member CRUD
router.get('/members', apiController.getMembers);
router.post('/members', apiController.addMember);
router.put('/members/:id', apiController.updateMember);
router.delete('/members/:id', apiController.deleteMember);
router.post('/members/upload-photo', upload.single('photo'), apiController.uploadMemberPhoto);

// Discography Data
router.get('/discography', apiController.getDiscography);

// Post-event gallery (public)
router.get('/post-events', postEventController.getPublicPostEvents);

// Admin Auth
router.post('/login', apiController.loginAdmin);

module.exports = router;

