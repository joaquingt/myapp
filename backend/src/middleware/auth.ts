import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../database/connection';
import { Technician } from '../types';

export interface AuthRequest extends Request {
  technician?: Technician;
}

export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, error: 'Access token required' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    const decoded = jwt.verify(token, secret) as { technicianId: number };
    
    const db = getDatabase();
    const technician = await db.get(
      `SELECT id, name, username, email, phone, photo_url, role, created_at, updated_at 
       FROM technicians WHERE id = ?`,
      [decoded.technicianId]
    );

    if (!technician) {
      res.status(403).json({ success: false, error: 'Invalid token' });
      return;
    }

    req.technician = technician;
    next();
  } catch (error) {
    res.status(403).json({ success: false, error: 'Invalid or expired token' });
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
}