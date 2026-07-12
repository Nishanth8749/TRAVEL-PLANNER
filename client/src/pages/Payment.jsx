import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { bookingAPI } from '@/services/api';
import { FaCreditCard, FaLock, FaSpinner, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';

const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    card_number: '',
    card_name: '',
    expiry: '',
    cvv: ''
  });

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const response = await bookingAPI.getById(id);
      setBooking(response.data);
    } catch (error) {
      console.error('Failed to fetch booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setProcessing(true);
      await bookingAPI.processPayment(id, formData);
      setSuccess(true);
      setTimeout(() => navigate('/bookings'), 3000);
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8"
        >
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="text-green-500 text-4xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Your booking has been confirmed. Redirecting to bookings...</p>
          <Link to="/bookings" className="btn-primary">View My Bookings</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-container bg-gray-50 dark:bg-dark-200">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={`/bookings/${id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 transition-colors">
          <FaArrowLeft /> Back to booking
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-dark-100 rounded-2xl shadow-md overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
            <h1 className="text-2xl font-bold mb-1">Secure Payment</h1>
            <p className="text-white/80">Complete your booking for {booking?.destination_name}</p>
          </div>

          <div className="p-6">
            <div className="mb-6 p-4 bg-gray-50 dark:bg-dark-200 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-300">Booking Total</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">${booking?.total_price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Tax (10%)</span>
                <span className="text-gray-700 dark:text-gray-300">${(booking?.total_price * 0.1).toFixed(2)}</span>
              </div>
              <div className="border-t dark:border-gray-700 mt-2 pt-2 flex justify-between font-semibold">
                <span className="text-gray-900 dark:text-white">Total</span>
                <span className="text-primary-600 dark:text-primary-400">${(booking?.total_price * 1.1).toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Card Number</label>
                <div className="relative">
                  <FaCreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="card_number"
                    value={formData.card_number}
                    onChange={handleChange}
                    placeholder="1234 5678 9012 3456"
                    className="input-field pl-12"
                    required
                    maxLength={16}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cardholder Name</label>
                <input
                  type="text"
                  name="card_name"
                  value={formData.card_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expiry Date</label>
                  <input
                    type="text"
                    name="expiry"
                    value={formData.expiry}
                    onChange={handleChange}
                    placeholder="MM/YY"
                    className="input-field"
                    required
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CVV</label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleChange}
                      placeholder="123"
                      className="input-field pl-12"
                      required
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-4">
                <FaLock className="text-green-500" />
                <span>Your payment information is encrypted and secure</span>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full btn-primary flex items-center justify-center gap-2 mt-6"
              >
                {processing ? <><FaSpinner className="animate-spin" /> Processing...</> : <>Pay ${(booking?.total_price * 1.1).toFixed(2)}</>}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Payment;
