import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { destinationAPI } from '@/services/api';
import { FaMapMarkedAlt, FaSearch, FaTrash, FaEdit, FaPlus, FaStar, FaSpinner } from 'react-icons/fa';

const AdminDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const response = await destinationAPI.getAll();
      setDestinations(response.data);
    } catch (error) {
      console.error('Failed to fetch destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDestination = async (id) => {
    if (!window.confirm('Delete this destination?')) return;
    try {
      await destinationAPI.delete(id);
      fetchDestinations();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const filteredDestinations = destinations.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.country?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Manage Destinations</h1>
            <p className="text-gray-500 dark:text-gray-400">{destinations.length} destinations</p>
          </div>
        </div>
      </motion.div>

      <div className="bg-white dark:bg-dark-100 rounded-2xl shadow-md overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search destinations..."
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
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Destination</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Location</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Price</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Rating</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Category</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {filteredDestinations.map((dest) => (
                  <tr key={dest.id} className="hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={dest.images?.[0]} alt={dest.name} className="w-12 h-12 rounded-lg object-cover" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{dest.name}</p>
                          <p className="text-sm text-gray-500">{dest.duration} days</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{dest.city}, {dest.country}</td>
                    <td className="px-6 py-4 font-medium text-primary-600 dark:text-primary-400">${dest.price}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1">
                        <FaStar className="text-yellow-400" /> {dest.rating}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg text-xs font-medium capitalize">
                        {dest.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link to={`/destinations/${dest.id}`} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => deleteDestination(dest.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
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

export default AdminDestinations;
