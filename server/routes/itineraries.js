const express = require('express');
const router = express.Router();
const itineraryController = require('../controllers/itineraryController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, itineraryController.getItineraries);
router.get('/:id', authenticate, itineraryController.getItineraryById);
router.post('/', authenticate, itineraryController.createItinerary);
router.put('/:id', authenticate, itineraryController.updateItinerary);
router.delete('/:id', authenticate, itineraryController.deleteItinerary);

module.exports = router;
