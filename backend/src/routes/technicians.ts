import express from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { getDatabase } from '../database/connection';
import { ApiResponse } from '../types';

const router = express.Router();

// GET /api/technicians/me - Get current technician profile
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    res.json({
      success: true,
      data: req.technician
    } as ApiResponse);
  } catch (error) {
    console.error('Get technician profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

export default router;