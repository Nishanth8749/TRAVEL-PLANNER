const express = require('express');
const router = express.Router();
const guideController = require('../controllers/guideController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', guideController.getGuides);
router.get('/:id', guideController.getGuideById);
router.post('/', authenticate, authorize('admin'), upload.single('avatar'), guideController.createGuide);
router.put('/:id', authenticate, authorize('admin'), upload.single('avatar'), guideController.updateGuide);
router.delete('/:id', authenticate, authorize('admin'), guideController.deleteGuide);

module.exports = router;
