import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { bookingAPI } from '@/services/api';
import { FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaClock, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaCreditCard, FaFileInvoice, FaSpinner } from 'react-icons/fa';

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getById(id);
      setBooking(response.data);
    } catch (error) {
      console.error('Failed to fetch booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      setCancelling(true);
      await bookingAPI.cancel(id);
      fetchBooking();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    } finally {
      setCancelling(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <FaCheckCircle className="text-green-500" />;
      case 'pending': return <FaHourglassHalf className="text-yellow-500" />;
      case 'cancelled': return <FaTimesCircle className="text-red-500" />;
      case 'completed': return <FaCheckCircle className="text-blue-500" />;
      default: return <FaHourglassHalf className="text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'cancelled': return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'completed': return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Booking not found</h2>
          <Link to="/bookings" className="text-primary-600">Back to bookings</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container bg-gray-50 dark:bg-dark-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/bookings" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 transition-colors">
          <FaArrowLeft /> Back to bookings
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="bg-white dark:bg-dark-100 rounded-2xl p-6 shadow-md mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Booking #{booking.id}</h1>
                <p className="text-gray-500 dark:text-gray-400">Booked on {new Date(booking.created_at).toLocaleDateString()}</p>
              </div>
              <span className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 ${getStatusColor(booking.status)}`}>
                {getStatusIcon(booking.status)} {booking.status?.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Destination */}
              <div className="bg-white dark:bg-dark-100 rounded-2xl p-6 shadow-md">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Destination</h2>
                <div className="flex gap-4">
                  <img
                    src={booking.images?.[0] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400'}
                    alt={booking.destination_name}
                    className="w-32 h-24 object-cover rounded-xl"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{booking.destination_name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1 text-sm">
                      <FaMapMarkerAlt /> {booking.city}, {booking.country}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1 text-sm mt-1">
                      <FaClock /> {booking.duration} days
                    </p>
                  </div>
                </div>
              </div>

              {/* Trip Details */}
              <div className="bg-white dark:bg-dark-100 rounded-2xl p-6 shadow-md">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Trip Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-dark-200 rounded-xl">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Departure Date</p>
                    <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <FaCalendarAlt className="text-primary-500" />
                      {new Date(booking.travel_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-dark-200 rounded-xl">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Return Date</p>
                    <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <FaCalendarAlt className="text-primary-500" />
                      {new Date(booking.return_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-dark-200 rounded-xl">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Guests</p>
                    <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <FaUsers className="text-primary-500" /> {booking.guests} person{booking.guests > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-dark-200 rounded-xl">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Duration</p>
                    <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <FaClock className="text-primary-500" /> {booking.duration} days
                    </p>
                  </div>
                </div>
                {booking.notes && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-dark-200 rounded-xl">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                    <p className="text-gray-700 dark:text-gray-300">{booking.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Payment Summary */}
              <div className="bg-white dark:bg-dark-100 rounded-2xl p-6 shadow-md">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Payment Summary</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-white">${booking.total_price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Tax (10%)</span>
                    <span className="text-gray-900 dark:text-white">${(booking.total_price * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="border-t dark:border-gray-700 pt-3 flex justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                    <span className="font-bold text-xl text-primary-600 dark:text-primary-400">${(booking.total_price * 1.1).toFixed(2)}</span>
                  </div>
                </div>
                <div className={`text-center py-2 rounded-lg text-sm font-medium mb-4 ${booking.payment_status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                  Payment: {booking.payment_status?.toUpperCase()}
                </div>

                {booking.status !== 'cancelled' && (
                  <div className="space-y-3">
                    {booking.payment_status !== 'paid' && (
                      <button
                        onClick={() => navigate(`/payment/${id}`)}
                        className="w-full btn-primary flex items-center justify-center gap-2"
                      >
                        <FaCreditCard /> Pay Now
                      </button>
                    )}
                    <Link
                      to={`/bookings/invoice/${id}`}
                      className="w-full btn-outline flex items-center justify-center gap-2"
                    >
                      <FaFileInvoice /> View Invoice
                    </Link>
                  </div>
                )}
              </div>

              {/* Actions */}
              {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                <div className="bg-white dark:bg-dark-100 rounded-2xl p-6 shadow-md">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">Actions</h3>
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="w-full py-3 border-2 border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {cancelling ? <FaSpinner className="animate-spin" /> : <FaTimesCircle />}
                    Cancel Booking
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingDetail;
