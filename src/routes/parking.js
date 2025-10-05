import express from 'express';
import pool from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// List all parking spots (public)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, location, is_available, user_id, created_at FROM parking_spots ORDER BY created_at DESC'
    );
    res.json({ spots: result.rows });
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

export default router;
