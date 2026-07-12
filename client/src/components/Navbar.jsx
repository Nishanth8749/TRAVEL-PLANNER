import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useNotifications } from '@/context/NotificationContext';
import {
  FaPlane,
  FaMoon,
  FaSun,
  FaUser,
  FaHeart,
  FaCalendarAlt,
  FaMapMarkedAlt,
  FaSignOutAlt,
  FaBell,
  FaEnvelope,
  FaBars,
  FaTimes,
  FaCompass,
  FaUsers,
  FaChartLine,
  FaShieldAlt
} from 'react-icons/fa';

const Navbar = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { unreadCount: notifCount } = useNotifications();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
  }, [location]);

  const navLinks = [
    { to: '/destinations', label: 'Destinations', icon: <FaMapMarkedAlt /> },
    { to: '/guides', label: 'Guides', icon: <FaUsers /> },
    { to: '/trip-planner', label: 'Trip Planner', icon: <FaCompass /> },
  ];

  const authLinks = [
    { to: '/bookings', label: 'My Bookings', icon: <FaCalendarAlt /> },
    { to: '/wishlist', label: 'Wishlist', icon: <FaHeart /> },
    { to: '/chat', label: 'Messages', icon: <FaEnvelope /> },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/90 dark:bg-dark-100/90 backdrop-blur-lg shadow-lg' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <FaPlane className="text-white text-lg" />
            </div>
            <span className={`text-xl font-bold ${isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'} hidden sm:block`}>
              Travel<span className="text-primary-500">Portal</span>
            </span>
          </Link>

          <div className={`hidden lg:flex items-center gap-1 ${isScrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white/90'}`}>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/20 ${
                  location.pathname === link.to ? 'bg-white/20' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className={`p-2.5 rounded-xl transition-all hover:bg-white/20 ${isScrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white'}`}
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>

            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className={`hidden sm:flex p-2.5 rounded-xl transition-all hover:bg-white/20 relative ${isScrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white'}`}
                >
                  <FaChartLine />
                </Link>
                <Link
                  to="/chat"
                  className={`hidden sm:flex p-2.5 rounded-xl transition-all hover:bg-white/20 relative ${isScrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white'}`}
                >
                  <FaEnvelope />
                </Link>
                <Link
                  to="/dashboard"
                  className={`hidden sm:flex p-2.5 rounded-xl transition-all hover:bg-white/20 relative ${isScrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white'}`}
                >
                  <FaBell />
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-white/20 transition-all"
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'}
                    alt={user?.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-white/50"
                  />
                  <span className={`hidden md:block text-sm font-medium ${isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
                    {user?.name?.split(' ')[0]}
                  </span>
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-100 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                      </div>
                      <div className="p-2">
                        <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors">
                          <FaUser className="text-primary-500" /> Profile
                        </Link>
                        <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors">
                          <FaChartLine className="text-primary-500" /> Dashboard
                        </Link>
                        <Link to="/bookings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors">
                          <FaCalendarAlt className="text-primary-500" /> My Bookings
                        </Link>
                        <Link to="/wishlist" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors">
                          <FaHeart className="text-primary-500" /> Wishlist
                        </Link>
                        {isAdmin && (
                          <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors">
                            <FaShieldAlt className="text-primary-500" /> Admin Panel
                          </Link>
                        )}
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <FaSignOutAlt /> Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isScrolled 
                      ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-200' 
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-all shadow-md"
                >
                  Get Started
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2.5 rounded-xl transition-all hover:bg-white/20 ${isScrolled ? 'text-gray-700 dark:text-white' : 'text-white'}`}
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-dark-100 border-t dark:border-gray-700 shadow-xl overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors"
                >
                  <span className="text-primary-500">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && authLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors"
                >
                  <span className="text-primary-500">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="flex gap-2 pt-2">
                  <Link to="/login" className="flex-1 text-center py-3 rounded-xl border-2 border-primary-600 text-primary-600 font-medium">
                    Sign In
                  </Link>
                  <Link to="/register" className="flex-1 text-center py-3 rounded-xl bg-primary-600 text-white font-medium">
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
