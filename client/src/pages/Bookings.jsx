import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { bookingAPI } from '@/services/api';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaUsers, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaChevronRight, FaReceipt } from 'react-icons/fa';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await bookingAPI.getAll(params);
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
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

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const upcoming = bookings.filter(b => b.status === 'confirmed' && new Date(b.travel_date) > new Date());
  const past = bookings.filter(b => b.status === 'completed' || (b.status === 'confirmed' && new Date(b.travel_date) <= new Date()));

  return (
    <div className="page-container bg-gray-50 dark:bg-dark-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">My Bookings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your trips and travel reservations</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Bookings', value: bookings.length, color: 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' },
            { label: 'Upcoming', value: upcoming.length, color: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' },
            { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
            { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length, color: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-5 rounded-2xl ${stat.color}`}
            >
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm opacity-80">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filter === f.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-dark-100 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-dark-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <FaCalendarAlt className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No bookings found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Start planning your next adventure</p>
            <Link to="/destinations" className="btn-primary inline-block">Explore Destinations</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, i) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/bookings/${booking.id}`} className="block bg-white dark:bg-dark-100 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all">
                  <div className="flex flex-col sm:flex-row gap-5">
                    <img
                      src={booking.images?.[0] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400'}
                      alt={booking.destination_name}
                      className="w-full sm:w-48 h-40 sm:h-32 object-cover rounded-xl"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{booking.destination_name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <FaMapMarkerAlt /> {booking.city}, {booking.country}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)} {booking.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300 mb-3">
                        <span className="flex items-center gap-1"><FaCalendarAlt /> {new Date(booking.travel_date).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><FaClock /> {booking.duration} days</span>
                        <span className="flex items-center gap-1"><FaUsers /> {booking.guests} guests</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary-600 dark:text-primary-400">${booking.total_price}</span>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-2 py-1 rounded-lg ${booking.payment_status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                            {booking.payment_status}
                          </span>
                          <FaChevronRight className="text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
