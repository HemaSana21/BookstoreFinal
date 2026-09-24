require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/connect');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Routes - one per actor/entity, per the project's spec structure
const userRoutes = require('./routes/userRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bookRoutes = require('./routes/bookRoutes');
const authorRoutes = require('./routes/authorRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

connectDB().then(async () => {
  // First start on an empty database: load the demo data automatically.
  // Set AUTO_SEED=false to disable.
  if (process.env.AUTO_SEED === 'false') return;
  try {
    const Book = require('./models/Book');
    const User = require('./models/Users/User');
    if ((await Book.countDocuments()) === 0 && (await User.countDocuments()) === 0) {
      console.log('Empty database detected - loading demo data...');
      await require('./config/seed')();
      console.log('Demo data loaded.');
    }
  } catch (err) {
    console.error('Auto-seed failed:', err.message);
  }
});

const app = express();

// Hosting platforms (Render, Railway, etc.) sit behind a reverse proxy
app.set('trust proxy', 1);

// Security & core middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        // book covers are loaded from external https hosts (e.g. openlibrary.org)
        'img-src': ["'self'", 'data:', 'https:'],
        'upgrade-insecure-requests': null
      }
    }
  })
);
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate limiting (protects the three login/register endpoints against brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: { success: false, message: 'Too many requests, please try again later' }
});
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);
app.use('/api/sellers/login', authLimiter);
app.use('/api/sellers/register', authLimiter);
app.use('/api/admin/login', authLimiter);

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'BookStore API is running' });
});

// Unknown /api routes -> JSON 404
app.use('/api', notFound);

// Serve the built React app (single-link deployment).
// Any non-API, non-upload route falls back to index.html so React Router works on refresh.
const clientBuild = path.join(__dirname, '..', 'client', 'build');
if (fs.existsSync(path.join(clientBuild, 'index.html'))) {
  app.use(express.static(clientBuild));
  app.get('*', (req, res) => res.sendFile(path.join(clientBuild, 'index.html')));
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});