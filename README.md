# Boutique Travel Planning Portal

A full-stack luxury travel planning web application built with React, Node.js, Express, and SQLite. Features include destination browsing, trip planning, bookings, wishlists, reviews, local guides, real-time chat, admin dashboard, and more.

## Features

### Authentication
- User Registration & Login with JWT
- Role-based access control (User/Admin)
- Profile management with avatar upload
- Password change functionality

### Destinations
- Browse 30+ curated destinations worldwide
- Advanced search & filtering (country, price, duration, rating, category)
- Detailed destination pages with image galleries
- Reviews and ratings system

### Bookings
- Book travel packages with date selection
- Booking management (view, cancel)
- Dummy payment processing
- Invoice generation
- Booking history with status tracking

### Trip Planner
- Create custom itineraries
- Select multiple destinations
- Set travel dates, budget, transportation
- Add activities and notes
- Save and manage trip plans

### Wishlist
- Save favorite destinations
- Quick access to saved items
- One-click removal

### Local Guides
- Browse expert local guides
- View guide profiles with specialties
- Contact guides via chat
- Filter by location and language

### Chat System
- Real-time messaging between travelers and guides
- Conversation list with unread counts
- Message history

### Notifications
- Booking confirmations
- Special offers
- Trip reminders
- Unread notification badges

### User Dashboard
- Personal travel statistics
- Charts (spending, booking status)
- Recent bookings overview
- Saved destinations
- Notification center

### Admin Panel
- Dashboard with analytics charts
- Manage Users (view, change roles, delete)
- Manage Destinations (CRUD operations)
- Manage Bookings (update status)
- Manage Reviews (moderate)
- Manage Guides (CRUD operations)
- Revenue statistics

### Design
- Luxury travel theme with blue and white color scheme
- Glassmorphism design elements
- Fully responsive layout
- Dark mode toggle
- Framer Motion animations
- Professional UI with Tailwind CSS

## Tech Stack

### Frontend
- React 19
- Vite
- React Router DOM
- Tailwind CSS 3
- Axios
- React Hook Form
- Framer Motion
- React Icons
- Chart.js with react-chartjs-2

### Backend
- Node.js
- Express.js
- SQLite (better-sqlite3)
- JWT Authentication
- bcryptjs
- Multer (file uploads)
- Helmet (security)
- CORS
- Express Rate Limit

## Project Structure

```
travel-portal/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   │   └── admin/      # Admin panel pages
│   │   ├── layouts/        # Layout components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── context/        # React contexts
│   │   ├── services/       # API service layer
│   │   ├── assets/         # Static assets
│   │   ├── App.jsx         # Main app component
│   │   ├── main.jsx        # Entry point
│   │   └── index.css       # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── server/                 # Express backend
│   ├── controllers/        # Route controllers
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── database/           # Database schema & seed
│   ├── config/             # Configuration files
│   ├── uploads/            # Uploaded files
│   ├── utils/              # Utility functions
│   ├── index.js            # Server entry point
│   ├── package.json
│   └── .env
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The server will start on `http://localhost:5000`

The database will be automatically created and seeded with sample data on first run.

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

### Login Credentials

**Admin Account:**
- Email: `admin@travelportal.com`
- Password: `admin123`

**Demo User Account:**
- Email: `sarah@email.com`
- Password: `password123`

Or register a new account.

## API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/profile` | Get user profile |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/change-password` | Change password |

### Destinations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/destinations` | Get all destinations |
| GET | `/api/destinations/featured` | Get featured destinations |
| GET | `/api/destinations/popular` | Get popular destinations |
| GET | `/api/destinations/:id` | Get destination by ID |
| POST | `/api/destinations` | Create destination (Admin) |
| PUT | `/api/destinations/:id` | Update destination (Admin) |
| DELETE | `/api/destinations/:id` | Delete destination (Admin) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bookings` | Get user bookings |
| GET | `/api/bookings/:id` | Get booking by ID |
| POST | `/api/bookings` | Create booking |
| PUT | `/api/bookings/:id` | Update booking |
| PUT | `/api/bookings/:id/cancel` | Cancel booking |
| PUT | `/api/bookings/:id/payment` | Process payment |
| GET | `/api/bookings/invoice/:id` | Get invoice |

### Wishlist
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wishlist` | Get wishlist |
| POST | `/api/wishlist` | Add to wishlist |
| DELETE | `/api/wishlist/:id` | Remove from wishlist |
| GET | `/api/wishlist/check/:id` | Check if in wishlist |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews` | Get reviews |
| POST | `/api/reviews` | Create review |
| PUT | `/api/reviews/:id` | Update review |
| DELETE | `/api/reviews/:id` | Delete review |

### Guides
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/guides` | Get all guides |
| GET | `/api/guides/:id` | Get guide by ID |
| POST | `/api/guides` | Create guide (Admin) |
| PUT | `/api/guides/:id` | Update guide (Admin) |
| DELETE | `/api/guides/:id` | Delete guide (Admin) |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/conversations` | Get conversations |
| GET | `/api/chat/messages/:userId` | Get messages |
| POST | `/api/chat/messages` | Send message |
| PUT | `/api/chat/read/:userId` | Mark as read |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get notifications |
| PUT | `/api/notifications/read/:id` | Mark as read |
| PUT | `/api/notifications/read-all` | Mark all as read |

### Itineraries
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/itineraries` | Get itineraries |
| GET | `/api/itineraries/:id` | Get itinerary by ID |
| POST | `/api/itineraries` | Create itinerary |
| PUT | `/api/itineraries/:id` | Update itinerary |
| DELETE | `/api/itineraries/:id` | Delete itinerary |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET | `/api/admin/users` | Get all users |
| PUT | `/api/admin/users/:id/role` | Update user role |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/bookings` | Get all bookings |
| PUT | `/api/admin/bookings/:id/status` | Update booking status |
| GET | `/api/admin/reviews` | Get all reviews |
| GET | `/api/admin/revenue` | Revenue statistics |

## Security Features

- JWT token-based authentication
- bcrypt password hashing
- Helmet.js security headers
- CORS configuration
- Rate limiting (1000 requests per 15 minutes)
- Input validation middleware
- Role-based authorization
- File upload restrictions (images only, 5MB max)

## Database

SQLite database is automatically created on first run with the following seeded data:
- 30 destinations across 29 countries
- 20 users (1 admin, 19 regular users)
- 20 local guides with specialties
- 50 reviews
- 20 bookings
- 10 sample messages
- 10 notifications

## Environment Variables

Create a `.env` file in the server directory:

```env
PORT=5000
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

## License

This project is licensed under the MIT License.
