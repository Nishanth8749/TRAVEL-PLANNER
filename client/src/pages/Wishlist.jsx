import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { wishlistAPI, destinationAPI } from '@/services/api';
import { FaHeart, FaMapMarkerAlt, FaStar, FaTrash, FaPlane } from 'react-icons/fa';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistAPI.getAll();
      setWishlist(response.data);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (id) => {
    try {
      await wishlistAPI.remove(id);
      setWishlist(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">My Wishlist</h1>
          <p className="text-gray-600 dark:text-gray-400">{wishlist.length} destination{wishlist.length !== 1 ? 's' : ''} saved</p>
        </motion.div>

        {wishlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-gray-100 dark:bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaHeart className="text-4xl text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Save destinations you love to plan your future trips</p>
            <Link to="/destinations" className="btn-primary inline-flex items-center gap-2">
              <FaPlane /> Explore Destinations
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {wishlist.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-dark-100 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group"
              >
                <div className="relative h-56 overflow-hidden">
                  <Link to={`/destinations/${item.destination_id}`}>
                    <img
                      src={item.images?.[0] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800'}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </Link>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <FaTrash />
                  </button>
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 text-sm font-semibold">
                    <FaStar className="text-yellow-400" /> {item.rating}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <Link to={`/destinations/${item.destination_id}`}>
                      <h3 className="text-white font-bold text-lg group-hover:text-primary-300 transition-colors">{item.name}</h3>
                      <div className="flex items-center gap-1 text-white/80 text-sm">
                        <FaMapMarkerAlt className="text-primary-300" />
                        {item.city}, {item.country}
                      </div>
                    </Link>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">${item.price}</span>
                      <span className="text-gray-400 text-sm"> / {item.duration} days</span>
                    </div>
                    <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-sm font-medium rounded-lg capitalize">
                      {item.category}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
