import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { destinationAPI } from '@/services/api';
import {
  FaPlane, FaMapMarkerAlt, FaStar, FaArrowRight, FaUmbrellaBeach,
  FaMountain, FaLandmark, FaHiking, FaGem, FaUsers, FaQuoteLeft,
  FaPaperPlane, FaCheckCircle
} from 'react-icons/fa';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [popular, setPopular] = useState([]);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featRes, popRes] = await Promise.all([
          destinationAPI.getFeatured(),
          destinationAPI.getPopular(),
        ]);
        setFeatured(featRes.data);
        setPopular(popRes.data);
      } catch (error) {
        console.error('Failed to fetch destinations:', error);
      }
    };
    fetchData();
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const categories = [
    { icon: <FaUmbrellaBeach />, name: 'Beach', count: '12 destinations', color: 'from-blue-400 to-cyan-400' },
    { icon: <FaMountain />, name: 'Mountain', count: '8 destinations', color: 'from-emerald-400 to-teal-400' },
    { icon: <FaLandmark />, name: 'Cultural', count: '10 destinations', color: 'from-amber-400 to-orange-400' },
    { icon: <FaHiking />, name: 'Adventure', count: '9 destinations', color: 'from-red-400 to-rose-400' },
    { icon: <FaGem />, name: 'Luxury', count: '6 destinations', color: 'from-purple-400 to-violet-400' },
  ];

  const testimonials = [
    { name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', location: 'Los Angeles, USA', text: 'The most incredible travel experience! Santorini exceeded all my expectations. The booking process was seamless and the guide was exceptional.', rating: 5 },
    { name: 'Michael Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', location: 'San Francisco, USA', text: 'TravelPortal made planning our honeymoon so easy. The personalized itinerary feature is a game-changer. Highly recommend!', rating: 5 },
    { name: 'Emma Williams', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', location: 'London, UK', text: 'Outstanding service and attention to detail. Every aspect of our trip to Japan was perfectly organized. Will definitely book again.', rating: 5 },
  ];

  const stats = [
    { icon: <FaMapMarkerAlt />, value: '30+', label: 'Destinations' },
    { icon: <FaUsers />, value: '20+', label: 'Expert Guides' },
    { icon: <FaStar />, value: '4.9', label: 'Average Rating' },
    { icon: <FaPlane />, value: '10K+', label: 'Happy Travelers' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920"
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-gradient" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
              Discover the World with Us
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Your Journey<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-teal-300">
                Begins Here
              </span>
            </h1>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Explore boutique destinations, create personalized itineraries, and connect with expert local guides for unforgettable travel experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/destinations"
                className="px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                Explore Destinations <FaArrowRight />
              </Link>
              <Link
                to="/trip-planner"
                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-all border border-white/30 flex items-center justify-center gap-2"
              >
                Plan Your Trip
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 dark:from-dark-200 to-transparent" />
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-dark-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center text-primary-500 text-2xl">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-gray-500 dark:text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-20 bg-gray-50 dark:bg-dark-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm uppercase tracking-wider">Curated Selection</span>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">Featured Destinations</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Hand-picked premium destinations that promise extraordinary experiences and lasting memories.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((dest, i) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <DestinationCard destination={dest} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-white dark:bg-dark-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm uppercase tracking-wider">Browse by Type</span>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">Travel Categories</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Find your perfect trip type from our carefully curated categories.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={`/destinations?category=${cat.name.toLowerCase()}`}
                  className="group block text-center p-8 rounded-2xl bg-gray-50 dark:bg-dark-100 hover:shadow-xl transition-all duration-300"
                >
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                    {cat.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{cat.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{cat.count}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Packages */}
      <section className="py-20 bg-gray-50 dark:bg-dark-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm uppercase tracking-wider">Trending Now</span>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">Popular Packages</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Our most-booked destinations loved by travelers worldwide.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popular.slice(0, 8).map((dest, i) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <DestinationCard destination={dest} compact />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-dark-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">What Travelers Say</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Real stories from our community of explorers.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-gray-50 dark:bg-dark-100 relative"
              >
                <FaQuoteLeft className="text-primary-200 dark:text-primary-900 text-4xl mb-4" />
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{testimonial.text}</p>
                <div className="flex items-center gap-3">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.location}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <FaStar key={j} className="text-yellow-400 text-sm" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 mx-auto mb-6 bg-white/20 rounded-2xl flex items-center justify-center">
              <FaPaperPlane className="text-white text-2xl" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-primary-100 mb-8 max-w-xl mx-auto">Get exclusive travel deals, destination guides, and insider tips delivered straight to your inbox.</p>

            {subscribed ? (
              <div className="flex items-center justify-center gap-3 text-white">
                <FaCheckCircle className="text-2xl" />
                <span className="text-lg font-semibold">Thank you for subscribing!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-6 py-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-lg"
                >
                  Subscribe
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

const DestinationCard = ({ destination, compact }) => {
  return (
    <Link
      to={`/destinations/${destination.id}`}
      className={`group block bg-white dark:bg-dark-100 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 ${compact ? '' : ''}`}
    >
      <div className={`relative overflow-hidden ${compact ? 'h-48' : 'h-64'}`}>
        <img
          src={destination.images?.[0] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800'}
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 text-sm font-semibold">
          <FaStar className="text-yellow-400" /> {destination.rating}
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-bold text-lg mb-1 group-hover:text-primary-300 transition-colors">{destination.name}</h3>
          <div className="flex items-center gap-1 text-white/80 text-sm">
            <FaMapMarkerAlt className="text-primary-300" />
            {destination.city}, {destination.country}
          </div>
        </div>
      </div>
      {!compact && (
        <div className="p-5">
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{destination.description}</p>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">${destination.price}</span>
              <span className="text-gray-400 text-sm"> / {destination.duration} days</span>
            </div>
            <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-sm font-medium rounded-lg capitalize">
              {destination.category}
            </span>
          </div>
        </div>
      )}
      {compact && (
        <div className="p-4 flex items-center justify-between">
          <span className="font-semibold text-gray-900 dark:text-white">${destination.price}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{destination.duration} days</span>
        </div>
      )}
    </Link>
  );
};

export default Home;
