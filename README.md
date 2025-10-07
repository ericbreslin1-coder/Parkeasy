# ParkEasy Backend

A comprehensive Node.js/Express backend for the ParkEasy parking management system with JWT authentication, PostgreSQL database, and full CRUD operations.

## 🚀 Features

- **Authentication System**
  - User registration and login with JWT
  - Password hashing with bcrypt
  - Protected routes with middleware
  - Admin role-based access control

- **Parking Management**
  - CRUD operations for parking spots
  - Advanced search and filtering
  - Pagination support
  - Owner-based access control

- **Reviews System**
  - Create, read, update, delete reviews
  - Rating system (1-5 stars)
  - Average rating calculations
  - User-based review management

- **Admin Dashboard**
  - User management
  - Parking spot management
  - Review moderation
  - Analytics and statistics

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠️ Installation

### 1. Clone and Setup

```bash
git clone <repository-url>
cd Parkeasy
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/parkeasy

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Admin Configuration
ADMIN_EMAILS=admin@parkeasy.com,your-admin-email@example.com

# API Configuration
API_BASE_URL=http://localhost:3000/api

# CORS Configuration
CORS_ORIGIN=http://localhost:3001
```

### 3. Database Setup

```bash
# Create database
createdb parkeasy

# Run migrations in order
psql -d parkeasy -f migrations/001_create_users_table.sql
psql -d parkeasy -f migrations/002_create_parking_spots_table.sql
psql -d parkeasy -f migrations/003_create_reviews_table.sql
```

### 4. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Parking Spots Endpoints

- `GET /api/parking` - List parking spots (with search, filter, pagination)
- `GET /api/parking/:id` - Get single parking spot
- `POST /api/parking` - Create parking spot (protected)
- `PUT /api/parking/:id` - Update parking spot (protected, owner only)
- `DELETE /api/parking/:id` - Delete parking spot (protected, owner only)

### Reviews Endpoints

- `GET /api/reviews/spot/:spotId` - Get reviews for a parking spot
- `GET /api/reviews/spot/:spotId/average` - Get average rating for a spot
- `POST /api/reviews` - Create review (protected)
- `PUT /api/reviews/:id` - Update review (protected, owner only)
- `DELETE /api/reviews/:id` - Delete review (protected, owner only)
- `GET /api/reviews/user/my-reviews` - Get user's own reviews (protected)

### Admin Endpoints (Admin Only)

- `GET /api/admin/users` - Get all users
- `GET /api/admin/parking-spots` - Get all parking spots
- `GET /api/admin/reviews` - Get all reviews
- `GET /api/admin/stats` - Get dashboard statistics
- `DELETE /api/admin/users/:id` - Delete user
- `DELETE /api/admin/parking-spots/:id` - Delete parking spot
- `DELETE /api/admin/reviews/:id` - Delete review

## 🔧 Advanced Features

### Search and Filtering

The parking spots endpoint supports advanced querying:

```
GET /api/parking?search=downtown&available=true&limit=20&offset=0&sortBy=created_at&sortOrder=DESC
```

Parameters:
- `search` - Search in location field
- `available` - Filter by availability (true/false)
- `limit` - Number of results per page (default: 50)
- `offset` - Pagination offset (default: 0)
- `sortBy` - Sort field (created_at, location, average_rating, review_count)
- `sortOrder` - Sort direction (ASC, DESC)

### Admin System

To become an admin, add your email to the `ADMIN_EMAILS` environment variable:

```env
ADMIN_EMAILS=admin@parkeasy.com,youremail@example.com,another-admin@example.com
```

## 🏗️ Project Structure

```
src/
├── config.js           # Environment configuration
├── index.js            # Main server file
├── db/
│   └── index.js        # Database connection
├── middleware/
│   └── auth.js         # Authentication middleware
└── routes/
    ├── auth.js         # Authentication routes
    ├── parking.js      # Parking management routes
    ├── reviews.js      # Reviews system routes
    └── admin.js        # Admin dashboard routes

migrations/
├── 001_create_users_table.sql
├── 002_create_parking_spots_table.sql
└── 003_create_reviews_table.sql
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- SQL injection prevention with parameterized queries
- CORS configuration
- Admin role-based access control
- Owner-based resource protection

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
JWT_SECRET=<strong-secret-key>
DATABASE_URL=<production-database-url>
CORS_ORIGIN=<frontend-domain>
```

### Database Considerations

- Ensure PostgreSQL is properly configured
- Set up database backups
- Consider connection pooling for high traffic
- Monitor database performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}

Response: 201 Created
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}

Response: 200 OK
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Parking Spot Endpoints

#### List All Parking Spots (Public)
```
GET /api/parking

Response: 200 OK
{
  "spots": [
    {
      "id": 1,
      "location": "123 Main St",
      "is_available": true,
      "user_id": 1,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Create Parking Spot (Protected)
```
POST /api/parking
Authorization: Bearer <token>
Content-Type: application/json

{
  "location": "123 Main St",
  "is_available": true
}

Response: 201 Created
{
  "message": "Parking spot created successfully",
  "spot": {
    "id": 1,
    "location": "123 Main St",
    "is_available": true,
    "user_id": 1,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Update Parking Spot (Protected, Owner Only)
```
PUT /api/parking/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "location": "456 Oak Ave",
  "is_available": false
}

Response: 200 OK
{
  "message": "Parking spot updated successfully",
  "spot": {
    "id": 1,
    "location": "456 Oak Ave",
    "is_available": false,
    "user_id": 1,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Delete Parking Spot (Protected, Owner Only)
```
DELETE /api/parking/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Parking spot deleted successfully",
  "deletedSpotId": "1"
}
```

## Authorization

Protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

Users can only update or delete parking spots they own (where `user_id` matches their JWT user ID).

## Error Responses

### 400 Bad Request
```json
{
  "error": "Name, email, and password are required"
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "You can only update your own parking spots"
}
```

### 404 Not Found
```json
{
  "error": "Parking spot not found"
}
```

### 409 Conflict
```json
{
  "error": "User with this email already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Project Structure

```
.
├── migrations/              # Database migration files
│   ├── 001_create_users_table.sql
│   └── 002_create_parking_spots_table.sql
├── src/
│   ├── config.js           # Configuration and environment variables
│   ├── db/
│   │   └── index.js        # Database connection pool
│   ├── middleware/
│   │   └── auth.js         # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js         # Authentication endpoints
│   │   └── parking.js      # Parking spot CRUD endpoints
│   └── index.js            # Main application entry point
├── .env.example            # Environment variables template
└── package.json            # Project dependencies
```

## Technologies Used

- **Express.js** - Web framework
- **PostgreSQL** - Database
- **pg** - PostgreSQL client for Node.js
- **jsonwebtoken** - JWT authentication
- **bcrypt** - Password hashing
- **dotenv** - Environment variable management

## Development

Run in development mode with auto-reload:
```bash
npm run dev
```

## License

MIT
