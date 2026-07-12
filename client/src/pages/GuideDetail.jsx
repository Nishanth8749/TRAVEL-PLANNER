import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { guideAPI } from '@/services/api';
import { FaArrowLeft, FaStar, FaMapMarkerAlt, FaLanguage, FaUserTie, FaDollarSign, FaEnvelope, FaCheckCircle } from 'react-icons/fa';

const GuideDetail = () => {
  const { id } = useParams();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuide();
  }, [id]);

  const fetchGuide = async () => {
    try {
      setLoading(true);
      const response = await guideAPI.getById(id);
      setGuide(response.data);
    } catch (error) {
      console.error('Failed to fetch guide:', error);
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

  if (!guide) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Guide not found</h2>
          <Link to="/guides" className="text-primary-600">Back to guides</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container bg-gray-50 dark:bg-dark-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/guides" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 transition-colors">
          <FaArrowLeft /> Back to guides
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white dark:bg-dark-100 rounded-2xl shadow-md overflow-hidden">
            <div className="h-48 bg-gradient-to-r from-primary-600 to-secondary-600 relative">
              <div className="absolute -bottom-16 left-8">
                <img
                  src={guide.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200'}
                  alt={guide.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-dark-100 shadow-lg"
                />
              </div>
            </div>

            <div className="pt-20 pb-8 px-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{guide.name}</h1>
                  <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-primary-500" /> {guide.location}
                  </p>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center gap-4">
                  <span className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl text-sm font-medium flex items-center gap-1">
                    <FaCheckCircle /> {guide.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-gray-50 dark:bg-dark-200 rounded-xl text-center">
                  <FaStar className="text-yellow-400 text-xl mx-auto mb-2" />
                  <p className="font-bold text-gray-900 dark:text-white">{guide.rating}</p>
                  <p className="text-xs text-gray-500">{guide.review_count} reviews</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-dark-200 rounded-xl text-center">
                  <FaUserTie className="text-primary-500 text-xl mx-auto mb-2" />
                  <p className="font-bold text-gray-900 dark:text-white">{guide.experience}+</p>
                  <p className="text-xs text-gray-500">Years exp.</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-dark-200 rounded-xl text-center">
                  <FaDollarSign className="text-green-500 text-xl mx-auto mb-2" />
                  <p className="font-bold text-gray-900 dark:text-white">${guide.price_per_day}</p>
                  <p className="text-xs text-gray-500">Per day</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-dark-200 rounded-xl text-center">
                  <FaLanguage className="text-secondary-500 text-xl mx-auto mb-2" />
                  <p className="font-bold text-gray-900 dark:text-white">{guide.languages?.length}</p>
                  <p className="text-xs text-gray-500">Languages</p>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">About</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{guide.bio}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Languages</h2>
                  <div className="flex flex-wrap gap-2">
                    {guide.languages?.map((lang, i) => (
                      <span key={i} className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl text-sm font-medium">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Specialties</h2>
                  <div className="flex flex-wrap gap-2">
                    {guide.specialties?.map((spec, i) => (
                      <span key={i} className="px-4 py-2 bg-secondary-50 dark:bg-secondary-900/20 text-secondary-600 dark:text-secondary-400 rounded-xl text-sm font-medium">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t dark:border-gray-700">
                <Link
                  to={`/chat`}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <FaEnvelope /> Contact Guide
                </Link>
                <Link
                  to={`/trip-planner`}
                  className="flex-1 btn-outline flex items-center justify-center gap-2"
                >
                  Book for Tour
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GuideDetail;
