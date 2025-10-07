// Mock database for testing without PostgreSQL
import bcrypt from 'bcrypt';

let users = [];
let isAdminCreated = false;
let parkingSpots = [
  {
    id: 1,
    location: "123 Main Street, Downtown",
    description: "Secure parking spot near shopping center",
    price: 8.50,
    is_available: true,
    user_id: 1,
    created_at: new Date()
  },
  {
    id: 2,
    location: "456 Oak Avenue, Business District",
    description: "Covered parking with 24/7 security",
    price: 12.00,
    is_available: true,
    user_id: 1,
    created_at: new Date()
  },
  {
    id: 3,
    location: "789 Pine Road, University Area",
    description: "Close to campus, perfect for students",
    price: 5.00,
    is_available: false,
    user_id: 1,
    created_at: new Date()
  },
  {
    id: 4,
    location: "321 Elm Street, Airport Zone",
    description: "Long-term parking for travelers",
    price: 15.00,
    is_available: true,
    user_id: 1,
    created_at: new Date()
  }
];
let reviews = [];

const mockDb = {
  query: async (text, params = []) => {
    console.log('Mock DB Query:', text, params);
    
    // Create admin user on first login attempt if not created yet
    if (!isAdminCreated && text.includes('SELECT * FROM users WHERE email') && params[0] === 'admin@parkeasy.com') {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      users.push({
        id: 1,
        name: 'Admin User',
        email: 'admin@parkeasy.com',
        password: hashedPassword,
        is_admin: true,
        created_at: new Date()
      });
      isAdminCreated = true;
      console.log('Admin user created dynamically');
    }
    
    // Handle user profile lookup by ID
    if (text.includes('SELECT id, name, email, is_admin, created_at FROM users WHERE id')) {
      const userId = params[0];
      const user = users.find(u => u.id === userId);
      return { rows: user ? [user] : [] };
    }
    
    // Handle user login by email
    if (text.includes('SELECT * FROM users WHERE email')) {
      const email = params[0];
      const user = users.find(u => u.email === email);
      console.log('Found user:', user ? { id: user.id, email: user.email, hasPassword: !!user.password } : 'Not found');
      return { rows: user ? [user] : [] };
    }
    
    // Handle user creation
    if (text.includes('INSERT INTO users')) {
      const [name, email, password, isAdmin] = params;
      
      // Check if user already exists
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        throw new Error('User already exists');
      }
      
      const user = {
        id: users.length + 1,
        name,
        email,
        password,
        is_admin: isAdmin || false,
        created_at: new Date()
      };
      users.push(user);
      return { rows: [user] };
    }
    
    // Handle parking spots listing
    if (text.includes('SELECT id, location, is_available, user_id, created_at') && text.includes('FROM parking_spots')) {
      // /my-spots query
      const userId = params[0];
      const userSpots = parkingSpots.filter(spot => spot.user_id === userId);
      return { rows: userSpots };
    }
    
    // Handle all parking spots listing
    if (text.includes('SELECT') && text.includes('FROM parking_spots') && !text.includes('WHERE user_id')) {
      // Simple fallback list (not reproducing joins/aggregations)
      return { rows: parkingSpots };
    }
    
    // Handle adding new parking spot
    if (text.includes('INSERT INTO parking_spots')) {
      // Adapt to expected parameter order in real code (location, is_available, user_id)
      const [location, is_available, user_id] = params;
      const newSpot = {
        id: parkingSpots.length + 1,
        location,
        description: '',
        price: null,
        is_available: is_available !== undefined ? is_available : true,
        user_id,
        created_at: new Date()
      };
      parkingSpots.push(newSpot);
      return { rows: [newSpot] };
    }
    
    // Handle reviews
    if (text.includes('FROM reviews') && text.includes('JOIN users')) {
      // Simulate joined reviews listing
      const joined = reviews.map(r => ({
        ...r,
        user_name: (users.find(u => u.id === r.user_id) || {}).name || 'User',
      }));
      return { rows: joined };
    }
    if (text.includes('SELECT * FROM reviews')) {
      return { rows: reviews };
    }
    
    return { rows: [] };
  }
};

// Admin user will be created on first login attempt
console.log('Mock database ready - admin user will be created on first login');

export default mockDb;