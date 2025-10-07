import express from 'express';
import pool from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all reviews for a specific parking spot (public)
router.get('/spot/:spotId', async (req, res) => {
  try {
    const spotId = req.params.spotId;

    // Validate spot exists
    const spotCheck = await pool.query('SELECT id FROM parking_spots WHERE id = $1', [spotId]);
    if (spotCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Parking spot not found' });
    }

    const result = await pool.query(`
      SELECT 
        r.id, 
        r.rating, 
        r.comment, 
        r.created_at, 
        r.updated_at,
        u.name as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.parking_spot_id = $1
      ORDER BY r.created_at DESC
    `, [spotId]);

    res.json({ reviews: result.rows });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get average rating for a specific parking spot (public)
router.get('/spot/:spotId/average', async (req, res) => {
  try {
    const spotId = req.params.spotId;

    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_reviews,
        ROUND(AVG(rating), 2) as average_rating
      FROM reviews 
      WHERE parking_spot_id = $1
    `, [spotId]);

    res.json({
      totalReviews: parseInt(result.rows[0].total_reviews),
      averageRating: parseFloat(result.rows[0].average_rating) || 0
    });
  } catch (error) {
    console.error('Error fetching average rating:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new review (protected)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { parking_spot_id, rating, comment } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!parking_spot_id || !rating) {
      return res.status(400).json({ error: 'Parking spot ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Validate parking spot exists
    const spotCheck = await pool.query('SELECT id FROM parking_spots WHERE id = $1', [parking_spot_id]);
    if (spotCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Parking spot not found' });
    }

    // Check if user already reviewed this spot
    const existingReview = await pool.query(
      'SELECT id FROM reviews WHERE parking_spot_id = $1 AND user_id = $2',
      [parking_spot_id, userId]
    );

    if (existingReview.rows.length > 0) {
      return res.status(409).json({ error: 'You have already reviewed this parking spot' });
    }

    // Insert new review
    const result = await pool.query(`
      INSERT INTO reviews (parking_spot_id, user_id, rating, comment) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, parking_spot_id, rating, comment, created_at
    `, [parking_spot_id, userId, rating, comment || null]);

    res.status(201).json({
      message: 'Review created successfully',
      review: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating review:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(409).json({ error: 'You have already reviewed this parking spot' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Update a review (protected, owner only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if review exists and belongs to user
    const existingReview = await pool.query(
      'SELECT * FROM reviews WHERE id = $1 AND user_id = $2',
      [reviewId, userId]
    );

    if (existingReview.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found or you do not have permission to edit it' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (rating !== undefined) {
      updates.push(`rating = $${paramCount}`);
      values.push(rating);
      paramCount++;
    }

    if (comment !== undefined) {
      updates.push(`comment = $${paramCount}`);
      values.push(comment);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Add review ID to values
    values.push(reviewId);

    const result = await pool.query(`
      UPDATE reviews 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${paramCount} 
      RETURNING id, parking_spot_id, rating, comment, created_at, updated_at
    `, values);

    res.json({
      message: 'Review updated successfully',
      review: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a review (protected, owner only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user.userId;

    // Check if review exists and belongs to user
    const result = await pool.query(
      'DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING id',
      [reviewId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found or you do not have permission to delete it' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all reviews by a specific user (protected, own reviews only)
router.get('/user/my-reviews', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(`
      SELECT 
        r.id, 
        r.rating, 
        r.comment, 
        r.created_at, 
        r.updated_at,
        ps.location as parking_spot_location,
        ps.id as parking_spot_id
      FROM reviews r
      JOIN parking_spots ps ON r.parking_spot_id = ps.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `, [userId]);

    res.json({ reviews: result.rows });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;