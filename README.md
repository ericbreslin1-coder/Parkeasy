# ParkEasy Backend

A Node.js/Express backend for the ParkEasy parking management system with JWT authentication and PostgreSQL database.

## Features

- User registration and authentication with JWT
- Password hashing with bcrypt
- CRUD operations for parking spots
- Authorization middleware for protected endpoints
- Ownership-based access control

## Setup

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/parkeasy
JWT_SECRET=your_secret_key_here
```

3. Create the database and run migrations:
```bash
# Create database
createdb parkeasy

# Run migrations
psql -d parkeasy -f migrations/001_create_users_table.sql
psql -d parkeasy -f migrations/002_create_parking_spots_table.sql
```

4. Start the server:
```bash
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
      "latitude": 40.7128,
      "longitude": -74.0060,
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
  "latitude": 40.7128,
  "longitude": -74.0060,
  "is_available": true
}

Response: 201 Created
{
  "message": "Parking spot created successfully",
  "spot": {
    "id": 1,
    "location": "123 Main St",
    "latitude": 40.7128,
    "longitude": -74.0060,
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
  "latitude": 40.7580,
  "longitude": -73.9855,
  "is_available": false
}

Response: 200 OK
{
  "message": "Parking spot updated successfully",
  "spot": {
    "id": 1,
    "location": "456 Oak Ave",
    "latitude": 40.7580,
    "longitude": -73.9855,
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
