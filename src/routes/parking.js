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

// Reserve a parking spot (protected)
router.post('/:id/reserve', authenticateToken, async (req, res) => {
  try {
    const spotId = req.params.id;
    const userId = req.user.userId;

    // Validate spot ID
    if (!spotId || isNaN(spotId)) {
      return res.status(400).json({ error: 'Invalid parking spot ID' });
    }

    // Check if spot exists
    const spotResult = await pool.query(
      'SELECT * FROM parking_spots WHERE id = $1',
      [spotId]
    );

    if (spotResult.rows.length === 0) {
      return res.status(404).json({ error: 'Parking spot not found' });
    }

    const spot = spotResult.rows[0];

    // Check if spot is available
    if (!spot.is_available) {
      return res.status(400).json({ error: 'Parking spot is not available' });
    }

    // Check if there's already an active reservation for this spot
    const existingReservation = await pool.query(
      'SELECT * FROM reservations WHERE parking_spot_id = $1 AND status = $2',
      [spotId, 'active']
    );

    if (existingReservation.rows.length > 0) {
      return res.status(409).json({ error: 'Parking spot is already reserved' });
    }

    // Start a transaction
    await pool.query('BEGIN');

    try {
      // Create the reservation
      const reservationResult = await pool.query(
        'INSERT INTO reservations (user_id, parking_spot_id, status) VALUES ($1, $2, $3) RETURNING *',
        [userId, spotId, 'active']
      );

      // Update parking spot availability
      await pool.query(
        'UPDATE parking_spots SET is_available = $1 WHERE id = $2',
        [false, spotId]
      );

      await pool.query('COMMIT');

      res.status(201).json({
        message: 'Parking spot reserved successfully',
        reservation: reservationResult.rows[0]
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error reserving parking spot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel a reservation (protected)
router.delete('/:id/reserve', authenticateToken, async (req, res) => {
  try {
    const spotId = req.params.id;
    const userId = req.user.userId;

    // Validate spot ID
    if (!spotId || isNaN(spotId)) {
      return res.status(400).json({ error: 'Invalid parking spot ID' });
    }

    // Check if there's an active reservation for this spot
    const reservationResult = await pool.query(
      'SELECT * FROM reservations WHERE parking_spot_id = $1 AND status = $2',
      [spotId, 'active']
    );

    if (reservationResult.rows.length === 0) {
      return res.status(404).json({ error: 'No active reservation found for this parking spot' });
    }

    const reservation = reservationResult.rows[0];

    // Check if the user owns the reservation
    if (reservation.user_id !== userId) {
      return res.status(403).json({ error: 'You can only cancel your own reservations' });
    }

    // Start a transaction
    await pool.query('BEGIN');

    try {
      // Update reservation status to cancelled
      await pool.query(
        'UPDATE reservations SET status = $1, cancelled_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['cancelled', reservation.id]
      );

      // Update parking spot availability
      await pool.query(
        'UPDATE parking_spots SET is_available = $1 WHERE id = $2',
        [true, spotId]
      );

      await pool.query('COMMIT');

      res.json({
        message: 'Reservation cancelled successfully',
        reservationId: reservation.id
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
