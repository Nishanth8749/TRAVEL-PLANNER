import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import {
  FaTachometerAlt,
  FaUsers,
  FaMapMarkedAlt,
  FaCalendarAlt,
  FaStar,
  FaUserTie,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaPlane
} from 'react-icons/fa';

const AdminLayout = () => {
  const location = useLocation();
  const { darkMode } = useTheme();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { to: '/admin', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { to: '/admin/users', label: 'Users', icon: <FaUsers /> },
    { to: '/admin/destinations', label: 'Destinations', icon: <FaMapMarkedAlt /> },
    { to: '/admin/bookings', label: 'Bookings', icon: <FaCalendarAlt /> },
    { to: '/admin/reviews', label: 'Reviews', icon: <FaStar /> },
    { to: '/admin/guides', label: 'Guides', icon: <FaUserTie /> },
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-dark-200' : 'bg-gray-50'}`}>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 bg-white dark:bg-dark-100 rounded-lg shadow-md flex items-center justify-center"
      >
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-dark-100 shadow-xl transform transition-transform lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <FaPlane className="text-white" />
            </div>
            <span className="text-lg font-bold dark:text-white">
              Admin<span className="text-primary-500">Panel</span>
            </span>
          </Link>
        </div>

        <nav className="px-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                location.pathname === item.to
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-200'
              }`}
            >
              <span className={location.pathname === item.to ? 'text-primary-500' : ''}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t dark:border-gray-700">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors"
          >
            <FaPlane /> Back to Site
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      <div className="lg:ml-64 min-h-screen">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
