import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { QRResponse } from '../types';
import './QRModal.css';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose }) => {
  const [qrData, setQrData] = useState<QRResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !qrData) {
      fetchQRCode();
    }
  }, [isOpen, qrData]);

  const fetchQRCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.getGoogleReviewQR();
      if (response.success && response.data) {
        setQrData(response.data);
      } else {
        setError(response.error || 'Failed to generate QR code');
      }
    } catch (err) {
      setError('Failed to load QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="qr-modal-backdrop" onClick={handleBackdropClick}>
      <div className="qr-modal">
        <div className="qr-modal-header">
          <h2>Leave us a Google Review! ⭐</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="qr-modal-content">
          {isLoading && (
            <div className="qr-loading">
              <div className="spinner"></div>
              <p>Generating QR code...</p>
            </div>
          )}

          {error && (
            <div className="qr-error">
              <p>❌ {error}</p>
              <button onClick={fetchQRCode} className="retry-button">
                Try Again
              </button>
            </div>
          )}

          {qrData && (
            <div className="qr-content">
              <div className="qr-message">
                <p>{qrData.message}</p>
              </div>

              <div className="qr-code-container">
                <img 
                  src={qrData.qr_code} 
                  alt="Google Review QR Code"
                  className="qr-code-image"
                />
              </div>


            </div>
          )}
        </div>

        <div className="qr-modal-footer">
          <button onClick={onClose} className="close-modal-button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRModal;