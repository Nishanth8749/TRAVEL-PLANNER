import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { adminAPI } from '@/services/api';
import {
  FaUsers, FaMapMarkedAlt, FaCalendarAlt, FaStar,
  FaUserTie, FaDollarSign, FaClock, FaArrowUp, FaArrowDown
} from 'react-icons/fa';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers, icon: <FaUsers />, color: 'bg-blue-500', link: '/admin/users' },
    { label: 'Destinations', value: stats?.totalDestinations, icon: <FaMapMarkedAlt />, color: 'bg-emerald-500', link: '/admin/destinations' },
    { label: 'Total Bookings', value: stats?.totalBookings, icon: <FaCalendarAlt />, color: 'bg-purple-500', link: '/admin/bookings' },
    { label: 'Total Revenue', value: `$${stats?.totalRevenue?.toLocaleString()}`, icon: <FaDollarSign />, color: 'bg-green-500', link: '/admin/revenue' },
    { label: 'Reviews', value: stats?.totalReviews, icon: <FaStar />, color: 'bg-yellow-500', link: '/admin/reviews' },
    { label: 'Guides', value: stats?.totalGuides, icon: <FaUserTie />, color: 'bg-orange-500', link: '/admin/guides' },
  ];

  const bookingsChart = {
    labels: stats?.bookingsByMonth?.map(b => b.month) || [],
    datasets: [{
      label: 'Bookings',
      data: stats?.bookingsByMonth?.map(b => b.count) || [],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderRadius: 6,
    }]
  };

  const revenueChart = {
    labels: stats?.bookingsByMonth?.map(b => b.month) || [],
    datasets: [{
      label: 'Revenue ($)',
      data: stats?.bookingsByMonth?.map(b => b.revenue) || [],
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
    }]
  };

  const statusChart = {
    labels: stats?.bookingsByStatus?.map(s => s.status) || [],
    datasets: [{
      data: stats?.bookingsByStatus?.map(s => s.count) || [],
      backgroundColor: ['#FCD34D', '#34D399', '#60A5FA', '#F87171'],
      borderWidth: 0,
    }]
  };

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Overview of your travel portal</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link to={stat.link} className="block bg-white dark:bg-dark-100 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all">
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center text-white mb-3`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-dark-100 rounded-2xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Bookings by Month</h3>
          <div className="h-64">
            <Bar data={bookingsChart} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
        <div className="bg-white dark:bg-dark-100 rounded-2xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Revenue Trend</h3>
          <div className="h-64">
            <Line data={revenueChart} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-dark-100 rounded-2xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Booking Status</h3>
          <div className="h-48">
            <Doughnut data={statusChart} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-dark-100 rounded-2xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Popular Destinations</h3>
          <div className="space-y-3">
            {stats?.popularDestinations?.map((dest, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center text-primary-600 font-bold text-sm">
                    {i + 1}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">{dest.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-500">{dest.bookings} bookings</span>
                  <span className="font-semibold text-green-600">${dest.revenue?.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
