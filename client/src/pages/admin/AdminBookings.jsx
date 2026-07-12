import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '@/services/api';
import { FaCalendarAlt, FaSearch, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaSpinner } from 'react-icons/fa';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllBookings();
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status, payment_status) => {
    try {
      await adminAPI.updateBookingStatus(id, { status, payment_status });
      fetchBookings();
    } catch (error) {
      console.error('Failed to update booking:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <FaCheckCircle className="text-green-500" />;
      case 'pending': return <FaHourglassHalf className="text-yellow-500" />;
      case 'cancelled': return <FaTimesCircle className="text-red-500" />;
      default: return <FaHourglassHalf className="text-gray-400" />;
    }
  };

  const filteredBookings = bookings.filter(b =>
    b.destination_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.user_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Manage Bookings</h1>
        <p className="text-gray-500 dark:text-gray-400">{bookings.length} total bookings</p>
      </motion.div>

      <div className="bg-white dark:bg-dark-100 rounded-2xl shadow-md overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bookings..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-dark-200 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-200 text-left">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">ID</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">User</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Destination</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Dates</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Amount</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors">
                    <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">#{booking.id}</td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 dark:text-white font-medium">{booking.user_name}</p>
                      <p className="text-sm text-gray-500">{booking.user_email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">{booking.destination_name}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">
                      {new Date(booking.travel_date).toLocaleDateString()} - {new Date(booking.return_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-primary-600 dark:text-primary-400">${booking.total_price}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-sm">
                        {getStatusIcon(booking.status)}
                        <span className="capitalize">{booking.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={booking.status}
                        onChange={(e) => updateStatus(booking.id, e.target.value, booking.payment_status)}
                        className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-dark-200 dark:text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;
