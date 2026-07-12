import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI, bookingAPI, wishlistAPI, reviewAPI, notificationAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import {
  FaPlane, FaHeart, FaCalendarAlt, FaStar, FaBell, FaCheckCircle,
  FaMapMarkerAlt, FaDollarSign, FaClock, FaChevronRight
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalTrips: 0, wishlistCount: 0, reviewsCount: 0, upcomingTrips: 0 });
  const [bookings, setBookings] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, bookingsRes, wishlistRes, reviewsRes, notifRes] = await Promise.all([
        authAPI.getProfile(),
        bookingAPI.getAll(),
        wishlistAPI.getAll(),
        reviewAPI.getAll({ user_id: user?.id }),
        notificationAPI.getAll(),
      ]);
      setStats(profileRes.data.stats);
      setBookings(bookingsRes.data);
      setWishlist(wishlistRes.data.slice(0, 4));
      setReviews(reviewsRes.data);
      setNotifications(notifRes.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentBookings = bookings.slice(0, 5);

  const bookingsByStatus = {
    labels: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    datasets: [{
      data: [
        bookings.filter(b => b.status === 'pending').length,
        bookings.filter(b => b.status === 'confirmed').length,
        bookings.filter(b => b.status === 'completed').length,
        bookings.filter(b => b.status === 'cancelled').length,
      ],
      backgroundColor: ['#FCD34D', '#34D399', '#60A5FA', '#F87171'],
      borderWidth: 0,
    }]
  };

  const spendingData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Spending ($)',
      data: [1200, 1900, 800, 2500, 1500, 2100],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderRadius: 8,
    }]
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="page-container bg-gray-50 dark:bg-dark-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back, {user?.name?.split(' ')[0]}! Here's your travel overview.</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Trips', value: stats.totalTrips, icon: <FaPlane />, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
            { label: 'Wishlist', value: stats.wishlistCount, icon: <FaHeart />, color: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' },
            { label: 'Reviews', value: stats.reviewsCount, icon: <FaStar />, color: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' },
            { label: 'Upcoming', value: stats.upcomingTrips, icon: <FaCalendarAlt />, color: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-dark-100 rounded-2xl p-5 shadow-md"
            >
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center text-xl mb-3`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-dark-100 rounded-2xl p-6 shadow-md">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Travel Spending</h2>
              <div className="h-64">
                <Bar data={spendingData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
              </div>
            </div>

            <div className="bg-white dark:bg-dark-100 rounded-2xl p-6 shadow-md">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Booking Status</h2>
              <div className="h-48 w-48 mx-auto">
                <Doughnut data={bookingsByStatus} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Notifications */}
            <div className="bg-white dark:bg-dark-100 rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaBell className="text-primary-500" /> Notifications
                </h2>
                <Link to="/dashboard" className="text-sm text-primary-600">View all</Link>
              </div>
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`p-3 rounded-xl ${notif.read ? 'bg-gray-50 dark:bg-dark-200' : 'bg-primary-50 dark:bg-primary-900/20'} flex items-start gap-3`}>
                    <div className={`w-2 h-2 rounded-full mt-2 ${notif.read ? 'bg-gray-300' : 'bg-primary-500'}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{notif.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{notif.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white dark:bg-dark-100 rounded-2xl p-6 shadow-md">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Bookings</h2>
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <Link
                    key={booking.id}
                    to={`/bookings/${booking.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors"
                  >
                    <img
                      src={booking.images?.[0]}
                      alt={booking.destination_name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{booking.destination_name}</p>
                      <p className="text-xs text-gray-500">{new Date(booking.travel_date).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      booking.status === 'confirmed' ? 'bg-green-50 text-green-600' :
                      booking.status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      {booking.status}
                    </span>
                  </Link>
                ))}
              </div>
              <Link to="/bookings" className="block text-center mt-4 text-sm text-primary-600 font-medium">
                View all bookings
              </Link>
            </div>

            {/* Quick Wishlist */}
            <div className="bg-white dark:bg-dark-100 rounded-2xl p-6 shadow-md">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Saved Destinations</h2>
              <div className="space-y-3">
                {wishlist.map((item) => (
                  <Link
                    key={item.id}
                    to={`/destinations/${item.destination_id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors"
                  >
                    <img
                      src={item.images?.[0]}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.city}, {item.country}</p>
                    </div>
                    <span className="text-sm font-semibold text-primary-600">${item.price}</span>
                  </Link>
                ))}
              </div>
              <Link to="/wishlist" className="block text-center mt-4 text-sm text-primary-600 font-medium">
                View wishlist
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
