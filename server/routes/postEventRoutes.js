const express = require('express');
const multer = require('multer');
const postEventController = require('../controllers/postEventController');

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 6 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

router.get('/', postEventController.getAllPostEvents);
router.post('/', postEventController.createPostEvent);
router.put('/:id', postEventController.updatePostEvent);
router.delete('/:id', postEventController.deletePostEvent);
router.post('/upload', upload.single('image'), postEventController.uploadPostEventImage);

module.exports = router;
