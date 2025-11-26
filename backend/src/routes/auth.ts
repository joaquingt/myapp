import express from 'express';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { getDatabase } from '../database/connection';
import { LoginRequest, AuthResponse, ApiResponse } from '../types';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password }: LoginRequest = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      } as ApiResponse);
    }

    const db = getDatabase();
    const technician = await db.get(
      `SELECT id, name, username, password_hash, email, phone, photo_url, role, created_at, updated_at 
       FROM technicians WHERE username = ?`,
      [username]
    );

    if (!technician) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      } as ApiResponse);
    }

    const isValidPassword = await bcrypt.compare(password, technician.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      } as ApiResponse);
    }

    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    
    // @ts-ignore - JWT typing issue but works correctly
    const token = jwt.sign(
      { technicianId: technician.id },
      secret,
      { expiresIn: expiresIn }
    );

    // Remove password_hash from response
    const { password_hash, ...technicianData } = technician;

    res.json({
      success: true,
      data: {
        token,
        technician: technicianData
      }
    } as ApiResponse<AuthResponse>);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

export default router;