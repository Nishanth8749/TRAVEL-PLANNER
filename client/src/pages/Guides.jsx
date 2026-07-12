import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { guideAPI } from '@/services/api';
import { FaSearch, FaStar, FaMapMarkerAlt, FaLanguage, FaUserTie, FaEnvelope } from 'react-icons/fa';

const Guides = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const response = await guideAPI.getAll();
      setGuides(response.data);
    } catch (error) {
      console.error('Failed to fetch guides:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = !search || 
      guide.name.toLowerCase().includes(search.toLowerCase()) ||
      guide.bio.toLowerCase().includes(search.toLowerCase());
    const matchesLocation = !location || 
      guide.location.toLowerCase().includes(location.toLowerCase());
    return matchesSearch && matchesLocation;
  });

  return (
    <div className="page-container bg-gray-50 dark:bg-dark-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Local Guides</h1>
          <p className="text-gray-600 dark:text-gray-400">Connect with expert guides for authentic local experiences</p>
        </motion.div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guides by name or specialty..."
              className="input-field pl-12"
            />
          </div>
          <div className="relative">
            <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Filter by location..."
              className="input-field pl-12"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGuides.map((guide, i) => (
              <motion.div
                key={guide.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-dark-100 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={guide.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'}
                    alt={guide.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{guide.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <FaMapMarkerAlt className="text-primary-500" /> {guide.location}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">{guide.bio}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {guide.specialties?.slice(0, 3).map((specialty, idx) => (
                    <span key={idx} className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg text-xs font-medium">
                      {specialty}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span className="flex items-center gap-1"><FaStar className="text-yellow-400" /> {guide.rating}</span>
                  <span className="flex items-center gap-1"><FaUserTie className="text-primary-500" /> {guide.experience} yrs</span>
                  <span className="flex items-center gap-1"><FaLanguage className="text-secondary-500" /> {guide.languages?.length}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                  <span className="font-bold text-primary-600 dark:text-primary-400">${guide.price_per_day}<span className="text-sm font-normal text-gray-500">/day</span></span>
                  <Link
                    to={`/guides/${guide.id}`}
                    className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Guides;
