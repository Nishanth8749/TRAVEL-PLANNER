import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { destinationAPI } from '@/services/api';
import {
  FaSearch, FaMapMarkerAlt, FaStar, FaFilter, FaUmbrellaBeach,
  FaMountain, FaLandmark, FaHiking, FaGem, FaTimes, FaSlidersH
} from 'react-icons/fa';

const Destinations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    country: searchParams.get('country') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minDuration: searchParams.get('minDuration') || '',
    maxDuration: searchParams.get('maxDuration') || '',
    minRating: searchParams.get('minRating') || '',
    sort: searchParams.get('sort') || 'rating:desc',
  });

  const categories = [
    { icon: <FaUmbrellaBeach />, name: 'beach', label: 'Beach' },
    { icon: <FaMountain />, name: 'mountain', label: 'Mountain' },
    { icon: <FaLandmark />, name: 'cultural', label: 'Cultural' },
    { icon: <FaHiking />, name: 'adventure', label: 'Adventure' },
    { icon: <FaGem />, name: 'luxury', label: 'Luxury' },
  ];

  const countries = ['Greece', 'Maldives', 'Switzerland', 'Japan', 'Kenya', 'Italy', 'Indonesia', 'Iceland', 'Morocco', 'Australia', 'Argentina', 'UAE', 'India', 'Costa Rica', 'Vietnam', 'Brazil', 'Fiji', 'French Polynesia', 'Peru', 'New Zealand', 'Seychelles', 'Canada', 'Russia', 'Turkey', 'USA', 'Sweden', 'Tanzania', 'Norway', 'Jordan'];

  useEffect(() => {
    fetchDestinations();
  }, [filters]);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const params = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      
      const queryString = new URLSearchParams(params).toString();
      setSearchParams(params);
      
      const response = await destinationAPI.getAll(params);

console.log("FULL RESPONSE:", response);
console.log("DATA:", response.data);
console.log("IS ARRAY:", Array.isArray(response.data));
console.log("LENGTH:", response.data?.length);

setDestinations(response.data);
    } catch (error) {
  console.log("ERROR", error);
  console.log("RESPONSE", error.response);
  console.log("DATA", error.response?.data);
} finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '', country: '', category: '', minPrice: '', maxPrice: '',
      minDuration: '', maxDuration: '', minRating: '', sort: 'rating:desc'
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v && v !== 'rating:desc');

  return (
    <div className="page-container bg-gray-50 dark:bg-dark-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Explore Destinations</h1>
          <p className="text-gray-600 dark:text-gray-400">Discover your next adventure from our curated collection</p>
        </motion.div>

        {/* Search Bar */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search destinations, countries, cities..."
              className="input-field pl-12 py-3.5"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-5 py-3.5 rounded-xl font-medium flex items-center gap-2 transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-dark-100 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <FaSlidersH /> Filters {hasActiveFilters && <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">!</span>}
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => handleFilterChange('category', '')}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              !filters.category ? 'bg-primary-600 text-white' : 'bg-white dark:bg-dark-100 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.name}
              onClick={() => handleFilterChange('category', cat.name)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                filters.category === cat.name ? 'bg-primary-600 text-white' : 'bg-white dark:bg-dark-100 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-dark-100 rounded-2xl p-6 shadow-md mb-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country</label>
                <select
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  className="input-field"
                >
                  <option value="">All Countries</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Min Rating</label>
                <select
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  className="input-field"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+</option>
                  <option value="4.0">4.0+</option>
                  <option value="3.5">3.5+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    placeholder="Min"
                    className="input-field"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    placeholder="Max"
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration (days)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.minDuration}
                    onChange={(e) => handleFilterChange('minDuration', e.target.value)}
                    placeholder="Min"
                    className="input-field"
                  />
                  <input
                    type="number"
                    value={filters.maxDuration}
                    onChange={(e) => handleFilterChange('maxDuration', e.target.value)}
                    placeholder="Max"
                    className="input-field"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                <FaTimes /> Clear all filters
              </button>
            </div>
          </motion.div>
        )}

        {/* Sort */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            {destinations.length} destination{destinations.length !== 1 ? 's' : ''} found
          </p>
          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="input-field py-2 w-auto"
          >
            <option value="rating:desc">Highest Rated</option>
            <option value="price:asc">Price: Low to High</option>
            <option value="price:desc">Price: High to Low</option>
            <option value="duration:asc">Shortest First</option>
            <option value="name:asc">Name A-Z</option>
          </select>
        </div>

        {/* Destination Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((dest, i) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/destinations/${dest.id}`} className="group block bg-white dark:bg-dark-100 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300">
                  <div className="relative h-56 overflow-hidden">
                    <img src={dest.images?.[0]} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 text-sm font-semibold">
                      <FaStar className="text-yellow-400" /> {dest.rating}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg">{dest.name}</h3>
                      <div className="flex items-center gap-1 text-white/80 text-sm">
                        <FaMapMarkerAlt className="text-primary-300" />
                        {dest.city}, {dest.country}
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{dest.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">${dest.price}</span>
                        <span className="text-gray-400 text-sm"> / {dest.duration} days</span>
                      </div>
                      <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-sm font-medium rounded-lg capitalize">
                        {dest.category}
                      </span>
                    </div>
                    {dest.weather && (
                      <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                        Weather: {dest.weather}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && destinations.length === 0 && (
          <div className="text-center py-20">
            <FaSearch className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No destinations found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Destinations;
