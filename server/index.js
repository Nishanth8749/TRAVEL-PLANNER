require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const sql = require('./config/sql');

const authRoutes = require('./routes/auth');
const destinationRoutes = require('./routes/destinations');
const bookingRoutes = require('./routes/bookings');
const wishlistRoutes = require('./routes/wishlist');
const reviewRoutes = require('./routes/reviews');
const guideRoutes = require('./routes/guides');
const chatRoutes = require('./routes/chat');
const notificationRoutes = require('./routes/notifications');
const itineraryRoutes = require('./routes/itineraries');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('dev'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/admin', adminRoutes);

// Health check
// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: "OK",
        database: "Azure SQL",
        message: "Boutique Travel Portal API Running",
        timestamp: new Date().toISOString()
    });
});
// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Boutique Travel Planning Portal API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      destinations: '/api/destinations',
      bookings: '/api/bookings',
      wishlist: '/api/wishlist',
      reviews: '/api/reviews',
      guides: '/api/guides',
      chat: '/api/chat',
      notifications: '/api/notifications',
      itineraries: '/api/itineraries',
      admin: '/api/admin'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
  }
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

(async () => {

    try {

        await sql;

        console.log("==================================");
        console.log("✅ Azure SQL Connected Successfully");
        console.log("==================================");

        app.listen(PORT, () => {

    console.log("----------------------------------");
    console.log("🚀 Boutique Travel Portal API Running");
    console.log(`🌐 Listening on Port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log("----------------------------------");

});

    }

    catch (error) {

        console.error("==================================");
        console.error("❌ Azure SQL Connection Failed");
        console.error(error);
        console.error("==================================");

        process.exit(1);

    }

})();