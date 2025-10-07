import express from 'express';
import pool from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// List all parking spots with enhanced filtering and search (public)
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      available, 
      limit = 50, 
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    // Build dynamic query
    let query = `
      SELECT 
        ps.id, 
        ps.location, 
        ps.is_available, 
        ps.user_id, 
        ps.created_at,
        u.name as owner_name,
        COUNT(r.id) as review_count,
        ROUND(AVG(r.rating), 2) as average_rating
      FROM parking_spots ps
      LEFT JOIN users u ON ps.user_id = u.id
      LEFT JOIN reviews r ON ps.id = r.parking_spot_id
    `;

    const conditions = [];
    const values = [];
    let paramCount = 1;

    // Add search filter
    if (search) {
      conditions.push(`LOWER(ps.location) LIKE LOWER($${paramCount})`);
      values.push(`%${search}%`);
      paramCount++;
    }

    // Add availability filter
    if (available !== undefined) {
      conditions.push(`ps.is_available = $${paramCount}`);
      values.push(available === 'true');
      paramCount++;
    }

    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Add GROUP BY
    query += ` GROUP BY ps.id, ps.location, ps.is_available, ps.user_id, ps.created_at, u.name`;

    // Add sorting
    const validSortFields = ['created_at', 'location', 'average_rating', 'review_count'];
    const validSortOrders = ['ASC', 'DESC'];
    
    if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder.toUpperCase())) {
      query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    } else {
      query += ` ORDER BY ps.created_at DESC`;
    }

    // Add pagination
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, values);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM parking_spots ps';
    const countConditions = [];
    const countValues = [];
    let countParamCount = 1;

    if (search) {
      countConditions.push(`LOWER(ps.location) LIKE LOWER($${countParamCount})`);
      countValues.push(`%${search}%`);
      countParamCount++;
    }

    if (available !== undefined) {
      countConditions.push(`ps.is_available = $${countParamCount}`);
      countValues.push(available === 'true');
      countParamCount++;
    }

    if (countConditions.length > 0) {
      countQuery += ` WHERE ${countConditions.join(' AND ')}`;
    }

    const countResult = await pool.query(countQuery, countValues);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({ 
      spots: result.rows,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < totalCount
      }
    });
  } catch (error) {
    console.error('Error fetching parking spots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new parking spot (protected)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { location, is_available } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    // Insert new parking spot
    const result = await pool.query(
      'INSERT INTO parking_spots (location, is_available, user_id) VALUES ($1, $2, $3) RETURNING *',
      [location, is_available !== undefined ? is_available : true, userId]
    );

    res.status(201).json({
      message: 'Parking spot created successfully',
      spot: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating parking spot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a parking spot (protected, owner only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const spotId = req.params.id;
    const userId = req.user.userId;
    const { location, is_available } = req.body;

    // Check if spot exists and user owns it
    const checkResult = await pool.query(
      'SELECT * FROM parking_spots WHERE id = $1',
      [spotId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Parking spot not found' });
    }

    const spot = checkResult.rows[0];
    if (spot.user_id !== userId) {
      return res.status(403).json({ error: 'You can only update your own parking spots' });
    }

    // Build update query dynamically based on provided fields
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (location !== undefined) {
      updates.push(`location = $${paramCount}`);
      values.push(location);
      paramCount++;
    }

    if (is_available !== undefined) {
      updates.push(`is_available = $${paramCount}`);
      values.push(is_available);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(spotId);
    const updateQuery = `UPDATE parking_spots SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const result = await pool.query(updateQuery, values);

    res.json({
      message: 'Parking spot updated successfully',
      spot: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating parking spot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a single parking spot with full details (public)
router.get('/:id', async (req, res) => {
  try {
    const spotId = req.params.id;

    const result = await pool.query(`
      SELECT 
        ps.id, 
        ps.location, 
        ps.is_available, 
        ps.user_id, 
        ps.created_at,
        u.name as owner_name,
        u.email as owner_email,
        COUNT(r.id) as review_count,
        ROUND(AVG(r.rating), 2) as average_rating
      FROM parking_spots ps
      LEFT JOIN users u ON ps.user_id = u.id
      LEFT JOIN reviews r ON ps.id = r.parking_spot_id
      WHERE ps.id = $1
      GROUP BY ps.id, ps.location, ps.is_available, ps.user_id, ps.created_at, u.name, u.email
    `, [spotId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parking spot not found' });
    }

    res.json({ spot: result.rows[0] });
  } catch (error) {
    console.error('Error fetching parking spot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a parking spot (protected, owner only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const spotId = req.params.id;
    const userId = req.user.userId;

    // Check if spot exists and user owns it
    const checkResult = await pool.query(
      'SELECT * FROM parking_spots WHERE id = $1',
      [spotId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Parking spot not found' });
    }

    const spot = checkResult.rows[0];
    if (spot.user_id !== userId) {
      return res.status(403).json({ error: 'You can only delete your own parking spots' });
    }

    // Delete the spot
    await pool.query('DELETE FROM parking_spots WHERE id = $1', [spotId]);

    res.json({
      message: 'Parking spot deleted successfully',
      deletedSpotId: spotId
    });
  } catch (error) {
    console.error('Error deleting parking spot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's own parking spots
router.get('/my-spots', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT id, location, is_available, user_id, created_at
       FROM parking_spots
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({ spots: result.rows });
  } catch (error) {
    console.error('Error fetching user parking spots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
