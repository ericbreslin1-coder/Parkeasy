# Database Migrations

This folder contains SQL migration files for the ParkEasy database.

## Running Migrations

To set up the database, run the migrations in order:

```bash
# Create the database (if it doesn't exist)
createdb parkeasy

# Run migrations in order
psql -d parkeasy -f migrations/001_create_users_table.sql
psql -d parkeasy -f migrations/002_create_parking_spots_table.sql
psql -d parkeasy -f migrations/003_create_reservations_table.sql
```

Or with a PostgreSQL connection string:

```bash
psql postgresql://username:password@host:port/parkeasy -f migrations/001_create_users_table.sql
psql postgresql://username:password@host:port/parkeasy -f migrations/002_create_parking_spots_table.sql
psql postgresql://username:password@host:port/parkeasy -f migrations/003_create_reservations_table.sql
```

## Migration Files

- `001_create_users_table.sql` - Creates the users table with authentication fields
- `002_create_parking_spots_table.sql` - Creates the parking_spots table with foreign key to users
- `003_create_reservations_table.sql` - Creates the reservations table for parking spot bookings

## Schema Overview

### users table
- `id` - Primary key (auto-increment)
- `name` - User's full name
- `email` - User's email (unique)
- `password` - Hashed password
- `created_at` - Timestamp of user registration

### parking_spots table
- `id` - Primary key (auto-increment)
- `location` - Location description/address of the parking spot
- `is_available` - Boolean flag indicating if spot is available
- `user_id` - Foreign key to users table (nullable, set to NULL on user deletion)
- `created_at` - Timestamp of spot creation

### reservations table
- `id` - Primary key (auto-increment)
- `user_id` - Foreign key to users table (deleted on user deletion)
- `parking_spot_id` - Foreign key to parking_spots table (deleted on spot deletion)
- `reserved_at` - Timestamp of reservation creation
- `status` - Reservation status ('active' or 'cancelled')
- `cancelled_at` - Timestamp of reservation cancellation (nullable)
