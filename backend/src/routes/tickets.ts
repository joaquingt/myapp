import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { getDatabase } from '../database/connection';
import { ApiResponse, TicketDetails, TicketWorkLog, TicketMedia, TicketSignature } from '../types';

const router = express.Router();

// Configure multer for file uploads
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { 
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }
  }
});

// GET /api/tickets/my-tickets - Get tickets assigned to logged-in technician
router.get('/my-tickets', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const db = getDatabase();
    const tickets = await db.all(`
      SELECT id, ticket_number, customer_name, customer_address, customer_phone,
             job_location, work_to_do, scheduled_date, scheduled_time, status,
             created_at, updated_at
      FROM tickets 
      WHERE technician_id = ? 
      ORDER BY scheduled_date, scheduled_time
    `, [req.technician!.id]);

    res.json({
      success: true,
      data: tickets
    } as ApiResponse);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// GET /api/tickets/:id - Get detailed ticket information
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const db = getDatabase();

    // Get ticket details
    const ticket = await db.get(`
      SELECT t.*, tech.name as technician_name, tech.email as technician_email,
             tech.phone as technician_phone, tech.photo_url as technician_photo_url,
             tech.role as technician_role
      FROM tickets t
      JOIN technicians tech ON t.technician_id = tech.id
      WHERE t.id = ? AND t.technician_id = ?
    `, [ticketId, req.technician!.id]);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      } as ApiResponse);
    }

    // Get work log
    const workLog = await db.get(`
      SELECT * FROM ticket_work_logs WHERE ticket_id = ?
    `, [ticketId]);

    // Get media files
    const media = await db.all(`
      SELECT * FROM ticket_media WHERE ticket_id = ? ORDER BY created_at
    `, [ticketId]);

    // Get signature (completion signature)
    const signature = await db.get(`
      SELECT * FROM ticket_signatures WHERE ticket_id = ?
    `, [ticketId]);

    // Get start signature
    const startSignature = await db.get(`
      SELECT * FROM ticket_start_signatures WHERE ticket_id = ?
    `, [ticketId]);

    // Format technician data
    const technician = {
      id: ticket.technician_id,
      name: ticket.technician_name,
      email: ticket.technician_email,
      phone: ticket.technician_phone,
      photo_url: ticket.technician_photo_url,
      role: ticket.technician_role
    };

    // Remove technician fields from ticket object
    const {
      technician_name,
      technician_email,
      technician_phone,
      technician_photo_url,
      technician_role,
      ...ticketData
    } = ticket;

    const ticketDetails: TicketDetails = {
      ...ticketData,
      technician,
      work_log: workLog,
      media: media || [],
      signature: signature,
      start_signature: startSignature
    };

    res.json({
      success: true,
      data: ticketDetails
    } as ApiResponse<TicketDetails>);

  } catch (error) {
    console.error('Get ticket details error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// POST /api/tickets/:id/work-log - Create or update work log
router.post('/:id/work-log', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const { work_description } = req.body;

    if (!work_description) {
      return res.status(400).json({
        success: false,
        error: 'Work description is required'
      } as ApiResponse);
    }

    const db = getDatabase();

    // Verify ticket belongs to technician
    const ticket = await db.get(`
      SELECT id FROM tickets WHERE id = ? AND technician_id = ?
    `, [ticketId, req.technician!.id]);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      } as ApiResponse);
    }

    // Check if work log exists
    const existingLog = await db.get(`
      SELECT id FROM ticket_work_logs WHERE ticket_id = ?
    `, [ticketId]);

    let workLog;
    if (existingLog) {
      // Update existing log
      await db.run(`
        UPDATE ticket_work_logs 
        SET work_description = ?, updated_at = CURRENT_TIMESTAMP
        WHERE ticket_id = ?
      `, [work_description, ticketId]);

      workLog = await db.get(`
        SELECT * FROM ticket_work_logs WHERE ticket_id = ?
      `, [ticketId]);
    } else {
      // Create new log
      const result = await db.run(`
        INSERT INTO ticket_work_logs (ticket_id, work_description)
        VALUES (?, ?)
      `, [ticketId, work_description]);

      workLog = await db.get(`
        SELECT * FROM ticket_work_logs WHERE id = ?
      `, [result.lastID]);
    }

    // Update ticket status to "In Progress" if not already
    await db.run(`
      UPDATE tickets 
      SET status = CASE 
        WHEN status = 'Assigned' THEN 'In Progress'
        ELSE status
      END,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [ticketId]);

    res.json({
      success: true,
      data: workLog,
      message: 'Work log saved successfully'
    } as ApiResponse<TicketWorkLog>);

  } catch (error) {
    console.error('Save work log error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// POST /api/tickets/:id/media - Upload media files
router.post('/:id/media', authenticateToken, upload.array('files'), async (req: AuthRequest, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      } as ApiResponse);
    }

    const db = getDatabase();

    // Verify ticket belongs to technician
    const ticket = await db.get(`
      SELECT id FROM tickets WHERE id = ? AND technician_id = ?
    `, [ticketId, req.technician!.id]);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      } as ApiResponse);
    }

    const mediaRecords = [];
    
    for (const file of files) {
      const mediaType = file.mimetype.startsWith('image/') ? 'photo' : 'video';
      const fileUrl = `/uploads/${file.filename}`;

      const result = await db.run(`
        INSERT INTO ticket_media (ticket_id, media_type, file_url, file_path, original_name, file_size)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [ticketId, mediaType, fileUrl, file.path, file.originalname, file.size]);

      const mediaRecord = await db.get(`
        SELECT * FROM ticket_media WHERE id = ?
      `, [result.lastID]);

      mediaRecords.push(mediaRecord);
    }

    res.json({
      success: true,
      data: mediaRecords,
      message: `${files.length} file(s) uploaded successfully`
    } as ApiResponse<TicketMedia[]>);

  } catch (error) {
    console.error('Upload media error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// POST /api/tickets/:id/signature - Save customer signature
router.post('/:id/signature', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const { signed_by_name, signature_image, signature_type } = req.body;

    if (!signed_by_name || !signature_image) {
      return res.status(400).json({
        success: false,
        error: 'Customer name and signature are required'
      } as ApiResponse);
    }

    const signatureType = signature_type || 'completion'; // Default to completion

    const db = getDatabase();

    // Verify ticket belongs to technician
    const ticket = await db.get(`
      SELECT id, status FROM tickets WHERE id = ? AND technician_id = ?
    `, [ticketId, req.technician!.id]);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      } as ApiResponse);
    }

    let signature;
    let newStatus = ticket.status;

    if (signatureType === 'start') {
      // Save start signature
      await db.run(`
        INSERT OR REPLACE INTO ticket_start_signatures (ticket_id, signed_by_name, signature_image)
        VALUES (?, ?, ?)
      `, [ticketId, signed_by_name, signature_image]);

      signature = await db.get(`
        SELECT * FROM ticket_start_signatures WHERE ticket_id = ?
      `, [ticketId]);

      // Update ticket status to "In Progress" when start signature is captured
      newStatus = 'In Progress';
      await db.run(`
        UPDATE tickets 
        SET status = 'In Progress', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [ticketId]);

    } else {
      // Save completion signature
      await db.run(`
        INSERT OR REPLACE INTO ticket_signatures (ticket_id, signed_by_name, signature_image)
        VALUES (?, ?, ?)
      `, [ticketId, signed_by_name, signature_image]);

      signature = await db.get(`
        SELECT * FROM ticket_signatures WHERE ticket_id = ?
      `, [ticketId]);

      // Update ticket status to "Signed" when completion signature is captured
      newStatus = 'Signed';
      await db.run(`
        UPDATE tickets 
        SET status = 'Signed', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [ticketId]);
    }

    res.json({
      success: true,
      data: { ...signature, signature_type: signatureType, new_status: newStatus },
      message: `Customer ${signatureType} signature saved successfully`
    } as ApiResponse<TicketSignature>);

  } catch (error) {
    console.error('Save signature error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

// PUT /api/tickets/:id/status - Update ticket status
router.put('/:id/status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      } as ApiResponse);
    }

    const validStatuses = ['Assigned', 'In Progress', 'Completed', 'Signed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      } as ApiResponse);
    }

    const db = getDatabase();

    // Verify ticket belongs to technician
    const ticket = await db.get(`
      SELECT id, status as current_status FROM tickets WHERE id = ? AND technician_id = ?
    `, [ticketId, req.technician!.id]);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: 'Ticket not found'
      } as ApiResponse);
    }

    // Update ticket status
    await db.run(`
      UPDATE tickets 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, ticketId]);

    res.json({
      success: true,
      data: { id: ticketId, status, previous_status: ticket.current_status },
      message: 'Ticket status updated successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse);
  }
});

export default router;