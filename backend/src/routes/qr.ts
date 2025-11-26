import express from 'express';
import QRCode from 'qrcode';
import { ApiResponse } from '../types';

const router = express.Router();

// GET /api/qr/google-review - Generate QR code for Google Reviews
router.get('/google-review', async (req, res) => {
  try {
    const googleReviewUrl = process.env.GOOGLE_REVIEW_URL || 
      'https://search.google.com/local/writereview?placeid=ChIJ4zh65TDHwoARD9qv25utrnk';

    // Generate QR code as base64 data URL
    const qrCodeDataUrl = await QRCode.toDataURL(googleReviewUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });

    res.json({
      success: true,
      data: {
        qr_code: qrCodeDataUrl,
        review_url: googleReviewUrl,
        message: 'Please scan this QR code or click the link to leave us a review on Google!'
      }
    } as ApiResponse);

  } catch (error) {
    console.error('QR code generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate QR code'
    } as ApiResponse);
  }
});

export default router;