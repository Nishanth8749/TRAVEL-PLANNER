import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { destinationAPI, bookingAPI, wishlistAPI, reviewAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import {
  FaMapMarkerAlt, FaStar, FaCalendarAlt, FaUsers, FaCloudSun,
  FaHeart, FaShare, FaArrowLeft, FaCheck, FaDollarSign, FaClock
} from 'react-icons/fa';

const DestinationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistId, setWishlistId] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({ travel_date: '', return_date: '', guests: 1, notes: '' });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    fetchDestination();
  }, [id]);

  const fetchDestination = async () => {
    try {
      setLoading(true);
      const response = await destinationAPI.getById(id);
      setDestination(response.data);
      if (isAuthenticated) {
        checkWishlist();
      }
    } catch (error) {
      console.error('Failed to fetch destination:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkWishlist = async () => {
    try {
      const response = await wishlistAPI.check(id);
      setIsInWishlist(response.data.isInWishlist);
      setWishlistId(response.data.wishlist_id);
    } catch (error) {
      console.error('Failed to check wishlist:', error);
    }
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      if (isInWishlist) {
        await wishlistAPI.remove(wishlistId);
        setIsInWishlist(false);
      } else {
        const response = await wishlistAPI.add(id);
        setIsInWishlist(true);
        setWishlistId(response.data.wishlist_id);
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      setBookingLoading(true);
      await bookingAPI.create({
        destination_id: parseInt(id),
        ...bookingData,
        guests: parseInt(bookingData.guests),
      });
      setShowBookingModal(false);
      navigate('/bookings');
    } catch (error) {
      console.error('Failed to create booking:', error);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      setReviewLoading(true);
      await reviewAPI.create({
        destination_id: parseInt(id),
        ...reviewData,
      });
      setReviewData({ rating: 5, comment: '' });
      fetchDestination();
    } catch (error) {
      console.error('Failed to add review:', error);
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Destination not found</h2>
          <Link to="/destinations" className="text-primary-600">Back to destinations</Link>
        </div>
      </div>
    );
  }

  const allImages = [...(destination.images || []), ...(destination.gallery || [])];

  return (
    <div className="page-container bg-gray-50 dark:bg-dark-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/destinations" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 transition-colors">
          <FaArrowLeft /> Back to destinations
        </Link>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="lg:col-span-2 relative h-80 lg:h-[500px] rounded-2xl overflow-hidden">
            <img src={allImages[activeImage]} alt={destination.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute top-4 right-4 flex gap-2">
              <button onClick={toggleWishlist} className={`p-3 rounded-full backdrop-blur-sm transition-all ${isInWishlist ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-700 hover:bg-white'}`}>
                <FaHeart />
              </button>
              <button className="p-3 rounded-full bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white transition-all">
                <FaShare />
              </button>
            </div>
            <div className="absolute bottom-4 left-4">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">{destination.name}</h1>
              <div className="flex items-center gap-2 text-white/90">
                <FaMapMarkerAlt /> {destination.city}, {destination.country}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 lg:grid-cols-2 gap-2">
            {allImages.slice(0, 4).map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`relative rounded-xl overflow-hidden h-24 lg:h-full ${activeImage === i ? 'ring-2 ring-primary-500' : ''}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-dark-100 rounded-2xl p-6 shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Overview</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">{destination.description}</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-dark-200 rounded-xl">
                  <FaStar className="text-yellow-400 text-xl mx-auto mb-2" />
                  <p className="font-semibold text-gray-900 dark:text-white">{destination.rating}</p>
                  <p className="text-xs text-gray-500">{destination.review_count} reviews</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-dark-200 rounded-xl">
                  <FaClock className="text-primary-500 text-xl mx-auto mb-2" />
                  <p className="font-semibold text-gray-900 dark:text-white">{destination.duration} days</p>
                  <p className="text-xs text-gray-500">Duration</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-dark-200 rounded-xl">
                  <FaDollarSign className="text-green-500 text-xl mx-auto mb-2" />
                  <p className="font-semibold text-gray-900 dark:text-white">${destination.price}</p>
                  <p className="text-xs text-gray-500">Per person</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-dark-200 rounded-xl">
                  <FaCloudSun className="text-orange-400 text-xl mx-auto mb-2" />
                  <p className="font-semibold text-gray-900 dark:text-white">{destination.weather}</p>
                  <p className="text-xs text-gray-500">Weather</p>
                </div>
              </div>
            </motion.div>

            {/* Activities */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-dark-100 rounded-2xl p-6 shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Activities</h2>
              <div className="flex flex-wrap gap-3">
                {destination.activities?.map((activity, i) => (
                  <span key={i} className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl text-sm font-medium flex items-center gap-2">
                    <FaCheck className="text-xs" /> {activity}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Reviews */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-dark-100 rounded-2xl p-6 shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Reviews ({destination.reviews?.length || 0})</h2>
              
              {isAuthenticated && (
                <form onSubmit={handleReview} className="mb-6 p-4 bg-gray-50 dark:bg-dark-200 rounded-xl">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Write a Review</h3>
                  <div className="flex gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}>
                        <FaStar className={`text-xl ${star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Share your experience..."
                    className="input-field mb-3"
                    rows={3}
                    required
                  />
                  <button type="submit" disabled={reviewLoading} className="btn-primary text-sm py-2 px-4">
                    {reviewLoading ? 'Posting...' : 'Post Review'}
                  </button>
                </form>
              )}

              <div className="space-y-4">
                {destination.reviews?.map((review) => (
                  <div key={review.id} className="flex gap-4 p-4 border-b dark:border-gray-700 last:border-0">
                    <img src={review.user_avatar} alt={review.user_name} className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white">{review.user_name}</span>
                        <div className="flex gap-0.5">
                          {[...Array(review.rating)].map((_, i) => <FaStar key={i} className="text-yellow-400 text-xs" />)}
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{review.comment}</p>
                      <p className="text-gray-400 text-xs mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-dark-100 rounded-2xl p-6 shadow-md sticky top-24">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">${destination.price}</span>
                <span className="text-gray-500">/ person</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{destination.duration} days / {destination.duration - 1} nights</p>
              
              <button
                onClick={() => setShowBookingModal(true)}
                className="w-full btn-primary mb-3"
              >
                Book Now
              </button>
              <Link
                to={`/trip-planner?destination=${id}`}
                className="w-full btn-outline block text-center"
              >
                Add to Trip Plan
              </Link>

              <div className="mt-6 pt-6 border-t dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Trip Highlights</h4>
                <ul className="space-y-2">
                  {destination.activities?.slice(0, 4).map((activity, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <FaCheck className="text-primary-500 text-xs" /> {activity}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-dark-100 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Book {destination.name}</h3>
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Travel Date</label>
                <input
                  type="date"
                  value={bookingData.travel_date}
                  onChange={(e) => setBookingData(prev => ({ ...prev, travel_date: e.target.value }))}
                  className="input-field"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Return Date</label>
                <input
                  type="date"
                  value={bookingData.return_date}
                  onChange={(e) => setBookingData(prev => ({ ...prev, return_date: e.target.value }))}
                  className="input-field"
                  required
                  min={bookingData.travel_date}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Guests</label>
                <input
                  type="number"
                  value={bookingData.guests}
                  onChange={(e) => setBookingData(prev => ({ ...prev, guests: e.target.value }))}
                  className="input-field"
                  min={1}
                  max={20}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes (optional)</label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                  className="input-field"
                  rows={2}
                  placeholder="Any special requests..."
                />
              </div>
              <div className="pt-2 border-t dark:border-gray-700">
                <div className="flex justify-between mb-4">
                  <span className="text-gray-600 dark:text-gray-300">Total</span>
                  <span className="text-xl font-bold text-primary-600 dark:text-primary-400">${destination.price * bookingData.guests}</span>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowBookingModal(false)} className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={bookingLoading} className="flex-1 btn-primary py-3">
                    {bookingLoading ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default DestinationDetail;
