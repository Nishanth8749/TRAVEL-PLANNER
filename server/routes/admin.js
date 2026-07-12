const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/dashboard', authenticate, authorize('admin'), adminController.getDashboardStats);
router.get('/users', authenticate, authorize('admin'), adminController.getAllUsers);
router.put('/users/:id/role', authenticate, authorize('admin'), adminController.updateUserRole);
router.delete('/users/:id', authenticate, authorize('admin'), adminController.deleteUser);
router.get('/bookings', authenticate, authorize('admin'), adminController.getAllBookings);
router.put('/bookings/:id/status', authenticate, authorize('admin'), adminController.updateBookingStatus);
router.get('/reviews', authenticate, authorize('admin'), adminController.getAllReviews);
router.get('/revenue', authenticate, authorize('admin'), adminController.getRevenueStats);

module.exports = router;
