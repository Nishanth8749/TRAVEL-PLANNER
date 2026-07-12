import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { guideAPI } from '@/services/api';
import { FaUserTie, FaSearch, FaTrash, FaStar, FaMapMarkerAlt, FaLanguage, FaSpinner } from 'react-icons/fa';

const AdminGuides = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const deleteGuide = async (id) => {
    if (!window.confirm('Delete this guide?')) return;
    try {
      await guideAPI.delete(id);
      fetchGuides();
    } catch (error) {
      console.error('Failed to delete guide:', error);
    }
  };

  const filteredGuides = guides.filter(g =>
    g.name?.toLowerCase().includes(search.toLowerCase()) ||
    g.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Manage Guides</h1>
        <p className="text-gray-500 dark:text-gray-400">{guides.length} total guides</p>
      </motion.div>

      <div className="bg-white dark:bg-dark-100 rounded-2xl shadow-md overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guides..."
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
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Guide</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Location</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Experience</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Rating</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Price/Day</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Languages</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {filteredGuides.map((guide) => (
                  <tr key={guide.id} className="hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={guide.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100'} alt={guide.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{guide.name}</p>
                          <p className="text-sm text-gray-500">{guide.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      <span className="flex items-center gap-1"><FaMapMarkerAlt className="text-primary-500 text-xs" /> {guide.location}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{guide.experience} years</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1"><FaStar className="text-yellow-400" /> {guide.rating}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-primary-600 dark:text-primary-400">${guide.price_per_day}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {guide.languages?.slice(0, 2).map((lang, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-dark-200 rounded text-xs text-gray-600 dark:text-gray-300">{lang}</span>
                        ))}
                        {guide.languages?.length > 2 && <span className="text-xs text-gray-400">+{guide.languages.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => deleteGuide(guide.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <FaTrash />
                      </button>
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

export default AdminGuides;
