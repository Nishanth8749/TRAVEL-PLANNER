import { Link } from 'react-router-dom';
import { FaPlane, FaMapMarkerAlt, FaPhone, FaEnvelope, FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaArrowUp } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';

const Footer = () => {
  const { darkMode } = useTheme();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const footerLinks = {
    Company: [
      { label: 'About Us', to: '#' },
      { label: 'Careers', to: '#' },
      { label: 'Press', to: '#' },
      { label: 'Blog', to: '#' },
    ],
    Support: [
      { label: 'Help Center', to: '#' },
      { label: 'Safety Information', to: '#' },
      { label: 'Cancellation Options', to: '#' },
      { label: 'Contact Us', to: '#' },
    ],
    Legal: [
      { label: 'Terms of Service', to: '#' },
      { label: 'Privacy Policy', to: '#' },
      { label: 'Cookie Policy', to: '#' },
      { label: 'Licenses', to: '#' },
    ],
  };

  return (
    <footer className={`${darkMode ? 'bg-dark-200 border-gray-700' : 'bg-gray-900'} text-white`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
                <FaPlane className="text-white text-lg" />
              </div>
              <span className="text-2xl font-bold">
                Travel<span className="text-primary-400">Portal</span>
              </span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              Your premium travel companion for unforgettable journeys. Discover boutique destinations, plan custom itineraries, and connect with expert local guides worldwide.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400">
                <FaMapMarkerAlt className="text-primary-400 shrink-0" />
                <span>123 Travel Street, New York, NY 10001</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <FaPhone className="text-primary-400 shrink-0" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <FaEnvelope className="text-primary-400 shrink-0" />
                <span>hello@travelportal.com</span>
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-lg mb-4">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-gray-400 hover:text-primary-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} TravelPortal. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {[FaFacebook, FaTwitter, FaInstagram, FaYoutube].map((Icon, i) => (
              <button
                key={i}
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary-600 flex items-center justify-center transition-colors"
              >
                <Icon className="text-sm" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-40"
      >
        <FaArrowUp />
      </button>
    </footer>
  );
};

export default Footer;
