const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, bookingController.getBookings);
router.get('/invoice/:id', authenticate, bookingController.getInvoice);
router.get('/:id', authenticate, bookingController.getBookingById);
router.post('/', authenticate, bookingController.createBooking);
router.put('/:id', authenticate, bookingController.updateBooking);
router.put('/:id/payment', authenticate, bookingController.processPayment);
router.put('/:id/cancel', authenticate, bookingController.cancelBooking);
router.delete('/:id', authenticate, bookingController.deleteBooking);

module.exports = router;
