const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, wishlistController.getWishlist);
router.get('/check/:destination_id', authenticate, wishlistController.checkWishlist);
router.post('/', authenticate, wishlistController.addToWishlist);
router.delete('/:id', authenticate, wishlistController.removeFromWishlist);

module.exports = router;
