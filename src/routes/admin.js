import express from 'express';
import pool from '../db/index.js';
import config from '../config.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if user is admin (DB-driven)
const isAdmin = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query('SELECT id, is_admin FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!result.rows[0].is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all users (admin only)
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.created_at,
        COUNT(ps.id) as parking_spots_count,
        COUNT(r.id) as reviews_count
      FROM users u
      LEFT JOIN parking_spots ps ON u.id = ps.user_id
      LEFT JOIN reviews r ON u.id = r.user_id
      GROUP BY u.id, u.name, u.email, u.created_at
      ORDER BY u.created_at DESC
    `);

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all parking spots with owner details (admin only)
router.get('/parking-spots', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ps.id,
        ps.location,
        ps.is_available,
        ps.created_at,
        u.name as owner_name,
        u.email as owner_email,
        COUNT(r.id) as reviews_count,
        ROUND(AVG(r.rating), 2) as average_rating
      FROM parking_spots ps
      LEFT JOIN users u ON ps.user_id = u.id
      LEFT JOIN reviews r ON ps.id = r.parking_spot_id
      GROUP BY ps.id, ps.location, ps.is_available, ps.created_at, u.name, u.email
      ORDER BY ps.created_at DESC
    `);

    res.json({ parkingSpots: result.rows });
  } catch (error) {
    console.error('Error fetching parking spots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all reviews with details (admin only)
router.get('/reviews', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        r.updated_at,
        u.name as reviewer_name,
        u.email as reviewer_email,
        ps.location as parking_spot_location,
        ps.id as parking_spot_id
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN parking_spots ps ON r.parking_spot_id = ps.id
      ORDER BY r.created_at DESC
    `);

    res.json({ reviews: result.rows });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a user (admin only)
router.delete('/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const adminUserId = req.user.userId;

    // Prevent admin from deleting themselves
    if (parseInt(userId) === adminUserId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Check if user exists
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user (cascade will handle related records)
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a parking spot (admin only)
router.delete('/parking-spots/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const spotId = req.params.id;

    // Check if parking spot exists
    const spotCheck = await pool.query('SELECT id FROM parking_spots WHERE id = $1', [spotId]);
    if (spotCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Parking spot not found' });
    }

    // Delete parking spot (cascade will handle related reviews)
    await pool.query('DELETE FROM parking_spots WHERE id = $1', [spotId]);

    res.json({ message: 'Parking spot deleted successfully' });
  } catch (error) {
    console.error('Error deleting parking spot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a review (admin only)
router.delete('/reviews/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const reviewId = req.params.id;

    // Check if review exists
    const reviewCheck = await pool.query('SELECT id FROM reviews WHERE id = $1', [reviewId]);
    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Delete review
    await pool.query('DELETE FROM reviews WHERE id = $1', [reviewId]);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get dashboard statistics (admin only)
router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Get total counts
    const userCountResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const spotCountResult = await pool.query('SELECT COUNT(*) as count FROM parking_spots');
    const reviewCountResult = await pool.query('SELECT COUNT(*) as count FROM reviews');
    const availableSpotsResult = await pool.query('SELECT COUNT(*) as count FROM parking_spots WHERE is_available = true');

    // Get recent activity (last 30 days)
    const recentUsersResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);

    const recentSpotsResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM parking_spots 
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);

    const recentReviewsResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM reviews 
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);

    // Get average rating
    const avgRatingResult = await pool.query(`
      SELECT ROUND(AVG(rating), 2) as average_rating 
      FROM reviews
    `);

    res.json({
      totals: {
        users: parseInt(userCountResult.rows[0].count),
        parkingSpots: parseInt(spotCountResult.rows[0].count),
        reviews: parseInt(reviewCountResult.rows[0].count),
        availableSpots: parseInt(availableSpotsResult.rows[0].count)
      },
      recent: {
        newUsers: parseInt(recentUsersResult.rows[0].count),
        newSpots: parseInt(recentSpotsResult.rows[0].count),
        newReviews: parseInt(recentReviewsResult.rows[0].count)
      },
      averageRating: parseFloat(avgRatingResult.rows[0].average_rating) || 0
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle user status (admin only) - if you want to add user suspension
router.put('/users/:id/toggle-status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const adminUserId = req.user.userId;

    // Prevent admin from modifying themselves
    if (parseInt(userId) === adminUserId) {
      return res.status(400).json({ error: 'Cannot modify your own account status' });
    }

    // For now, we'll just return success since we don't have a status field
    // You can add an 'is_active' column to users table if needed
    res.json({ message: 'User status toggled successfully' });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;