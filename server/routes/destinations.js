const express = require('express');
const router = express.Router();
const destinationController = require('../controllers/destinationController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', destinationController.getAllDestinations);
router.get('/featured', destinationController.getFeaturedDestinations);
router.get('/popular', destinationController.getPopularDestinations);
router.get('/category/:category', destinationController.getDestinationsByCategory);
router.get('/:id', destinationController.getDestinationById);
router.post('/', authenticate, authorize('admin'), upload.any(), destinationController.createDestination);
router.put('/:id', authenticate, authorize('admin'), upload.any(), destinationController.updateDestination);
router.delete('/:id', authenticate, authorize('admin'), destinationController.deleteDestination);

module.exports = router;
