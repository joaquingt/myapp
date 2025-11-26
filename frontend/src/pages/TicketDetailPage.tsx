import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { TicketDetails, TicketMedia } from '../types';
import SignaturePad, { SignaturePadRef } from '../components/SignaturePad';
import QRModal from '../components/QRModal';
import { useAuth } from '../context/AuthContext';
import './TicketDetailPage.css';

const TicketDetailPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { technician } = useAuth();
  const signaturePadRef = useRef<SignaturePadRef>(null);
  
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Work Log State
  const [workDescription, setWorkDescription] = useState('');
  const [isSavingWorkLog, setIsSavingWorkLog] = useState(false);
  const [workLogSuccess, setWorkLogSuccess] = useState(false);
  
  // Media Upload State
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  // Signature State
  const [customerName, setCustomerName] = useState('');
  const [isSavingSignature, setIsSavingSignature] = useState(false);
  const [showSignatureSection, setShowSignatureSection] = useState(false);
  
  // QR Modal State
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    if (ticketId) {
      fetchTicketDetails(parseInt(ticketId));
    }
  }, [ticketId]);

  // Remove auto status update - tickets should only change status after signature capture

  useEffect(() => {
    if (ticket?.work_log?.work_description) {
      setWorkDescription(ticket.work_log.work_description);
    }
  }, [ticket]);

  const fetchTicketDetails = async (id: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getTicketDetails(id);
      if (response.success && response.data) {
        setTicket(response.data);
      } else {
        setError(response.error || 'Failed to load ticket details');
      }
    } catch (err) {
      setError('Failed to load ticket details');
      console.error('Error fetching ticket details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWorkLog = async () => {
    if (!ticket || !workDescription.trim()) return;
    
    setIsSavingWorkLog(true);
    setWorkLogSuccess(false);
    
    try {
      const response = await apiService.saveWorkLog(ticket.id, workDescription.trim());
      if (response.success) {
        setWorkLogSuccess(true);
        // Update ticket with new work log
        setTicket(prev => prev ? {
          ...prev,
          work_log: response.data
        } : null);
        
        setTimeout(() => setWorkLogSuccess(false), 3000);
      } else {
        alert(response.error || 'Failed to save work log');
      }
    } catch (err) {
      alert('Failed to save work log');
      console.error('Error saving work log:', err);
    } finally {
      setIsSavingWorkLog(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Validate file types and sizes
      const validFiles = Array.from(files).filter(file => {
        const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
        const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB limit
        return isValidType && isValidSize;
      });
      
      if (validFiles.length !== files.length) {
        alert('Some files were skipped. Only image and video files under 50MB are allowed.');
      }
      
      if (validFiles.length > 0) {
        const dt = new DataTransfer();
        validFiles.forEach(file => dt.items.add(file));
        setSelectedFiles(dt.files);
      }
    }
  };

  const handleUploadMedia = async () => {
    if (!ticket || !selectedFiles || selectedFiles.length === 0) return;
    
    setIsUploadingMedia(true);
    setUploadProgress(0);
    
    try {
      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      const response = await apiService.uploadMedia(ticket.id, selectedFiles);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (response.success && response.data) {
        // Update ticket with new media
        setTicket(prev => prev ? {
          ...prev,
          media: [...(prev.media || []), ...(response.data || [])]
        } : null);
        
        setSelectedFiles(null);
        // Reset file input
        const fileInput = document.getElementById('media-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        setTimeout(() => setUploadProgress(0), 1000);
      } else {
        alert(response.error || 'Failed to upload media');
      }
    } catch (err) {
      alert('Failed to upload media');
      console.error('Error uploading media:', err);
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleSaveSignature = async () => {
    if (!ticket || !customerName.trim() || !signaturePadRef.current) return;
    
    const isEmpty = signaturePadRef.current.isEmpty();
    if (isEmpty) {
      alert('Please provide a signature');
      return;
    }
    
    const signatureData = signaturePadRef.current.getSignatureData();
    if (!signatureData) {
      alert('Failed to capture signature');
      return;
    }
    
    setIsSavingSignature(true);
    
    // Determine signature type based on ticket status
    const signatureType = ticket.status === 'Assigned' ? 'start' : 'completion';
    const isStartSignature = signatureType === 'start';
    
    try {
      const response = await apiService.saveSignature(
        ticket.id,
        customerName.trim(),
        signatureData,
        signatureType
      );
      
      if (response.success && response.data) {
        // Update ticket based on signature type
        if (isStartSignature) {
          setTicket(prev => prev ? {
            ...prev,
            start_signature: response.data,
            status: 'In Progress'
          } : null);
          // Don't show QR modal for start signature
          setShowSignatureSection(false);
        } else {
          setTicket(prev => prev ? {
            ...prev,
            signature: response.data,
            status: 'Signed'
          } : null);
          // Show QR modal only for completion signature
          setShowQRModal(true);
          setShowSignatureSection(false);
        }
      } else {
        alert(response.error || 'Failed to save signature');
      }
    } catch (err) {
      alert('Failed to save signature');
      console.error('Error saving signature:', err);
    } finally {
      setIsSavingSignature(false);
    }
  };

  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Assigned': return 'status-assigned';
      case 'In Progress': return 'status-in-progress';
      case 'Completed': return 'status-completed';
      case 'Signed': return 'status-signed';
      default: return 'status-default';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (isLoading) {
    return (
      <div className="ticket-detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="ticket-detail-page">
        <div className="error-container">
          <h2>Error Loading Ticket</h2>
          <p>{error || 'Ticket not found'}</p>
          <button onClick={() => navigate('/dashboard')} className="back-btn">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-detail-page">
      {/* Header */}
      <header className="ticket-header">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          ← Back
        </button>
        <div className="ticket-title">
          <h1>Ticket #{ticket.ticket_number}</h1>
          <div className={`ticket-status ${getStatusColor(ticket.status)}`}>
            {ticket.status}
          </div>
        </div>
        <button 
          onClick={() => setShowQRModal(true)}
          className="qr-button"
        >
          📱 QR Review
        </button>
      </header>

      <div className="ticket-content">
        {/* Show Technician Info for Assigned tickets */}
        {ticket.status === 'Assigned' && technician && (
          <section className="technician-info">
            <h2>Assigned Technician</h2>
            <div className="tech-profile">
              {technician.photo_url && (
                <img 
                  src={technician.photo_url} 
                  alt={technician.name}
                  className="tech-photo"
                />
              )}
              <div className="tech-details">
                <h3>{technician.name}</h3>
                <p className="tech-role">{technician.role}</p>
                <p className="tech-email">{technician.email}</p>
                {technician.phone && (
                  <a href={`tel:${technician.phone}`} className="tech-phone">
                    📞 {technician.phone}
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Job Details Section - Always show */}
        <section className="job-details">
          <h2>Job Details</h2>
          <div className="details-grid">
            <div className="detail-item">
              <label>Customer:</label>
              <span>{ticket.customer_name}</span>
            </div>
            <div className="detail-item">
              <label>Address:</label>
              <span>{ticket.customer_address}</span>
            </div>
            <div className="detail-item">
              <label>Phone:</label>
              {ticket.customer_phone ? (
                <a href={`tel:${ticket.customer_phone}`} className="phone-link">
                  {ticket.customer_phone}
                </a>
              ) : (
                <span>Not provided</span>
              )}
            </div>
            <div className="detail-item">
              <label>Location:</label>
              <span>{ticket.job_location}</span>
            </div>
            <div className="detail-item">
              <label>Scheduled:</label>
              <span>
                {formatDate(ticket.scheduled_date)} at {formatTime(ticket.scheduled_time)}
              </span>
            </div>
          </div>
          
          <div className="work-description">
            <h3>Work to be Done</h3>
            <p>{ticket.work_to_do}</p>
          </div>
        </section>

        {/* Work Log Section - Show for In Progress, Completed, or Signed tickets */}
        {['In Progress', 'Completed', 'Signed'].includes(ticket.status) && (
          <section className="work-log-section">
            <h2>Work Log</h2>
            <div className="work-log-form">
              <textarea
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                placeholder="Describe the work performed, parts used, issues encountered, etc..."
                rows={6}
                className="work-log-textarea"
              />
              <div className="work-log-actions">
                <button
                  onClick={handleSaveWorkLog}
                  disabled={isSavingWorkLog || !workDescription.trim()}
                  className="save-work-log-btn"
                >
                  {isSavingWorkLog ? 'Saving...' : 'Save Work Log'}
                </button>
                {workLogSuccess && (
                  <span className="success-message">✓ Work log saved!</span>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Media Upload Section - Show for Assigned, In Progress, Completed, or Signed tickets */}
        {['Assigned', 'In Progress', 'Completed', 'Signed'].includes(ticket.status) && (
        <section className="media-section">
          <h2>Photos & Videos</h2>
          
          <div className="media-upload">
            <input
              type="file"
              id="media-upload"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="file-input"
            />
            <label htmlFor="media-upload" className="file-upload-label">
              📷 Select Photos/Videos
            </label>
            
            {selectedFiles && selectedFiles.length > 0 && (
              <div className="selected-files">
                <p>{selectedFiles.length} file(s) selected</p>
                <button
                  onClick={handleUploadMedia}
                  disabled={isUploadingMedia}
                  className="upload-btn"
                >
                  {isUploadingMedia ? 'Uploading...' : 'Upload Files'}
                </button>
              </div>
            )}
            
            {isUploadingMedia && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <span>{uploadProgress}%</span>
              </div>
            )}
          </div>

          {/* Media Gallery */}
          {ticket.media && ticket.media.length > 0 && (
            <div className="media-gallery">
              <h3>Uploaded Media ({ticket.media.length})</h3>
              <div className="media-grid">
                {ticket.media.map((media: TicketMedia) => (
                  <div key={media.id} className="media-item">
                    {media.media_type === 'photo' ? (
                      <img 
                        src={media.file_url} 
                        alt={`Job documentation from ${media.original_name || 'camera'}`}
                        className="media-thumbnail"
                        onClick={() => window.open(media.file_url, '_blank')}
                      />
                    ) : (
                      <video 
                        src={media.file_url}
                        className="media-thumbnail"
                        controls
                      />
                    )}
                    <div className="media-info">
                      <span className="media-type">
                        {media.media_type === 'photo' ? '📷' : '🎥'}
                      </span>
                      <span className="media-name">
                        {media.original_name || 'Media file'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
        )}

        {/* Signature Section - Show for Assigned, In Progress, Completed, or Signed tickets */}
        {['Assigned', 'In Progress', 'Completed', 'Signed'].includes(ticket.status) && (
        <section className="signature-section">
          <h2>
            {ticket.status === 'Assigned' 
              ? 'Customer Signature to Start Job' 
              : ticket.status === 'In Progress' 
                ? 'Customer Signature to Complete Job'
                : 'Customer Signature'}
          </h2>
          
          {/* Show start signature if it exists (for In Progress onwards) */}
          {ticket.start_signature && ticket.status !== 'Assigned' && (
            <div className="existing-signature">
              <h3>Job Start Signature</h3>
              <div className="signature-info">
                <p><strong>Signed by:</strong> {ticket.start_signature.signed_by_name}</p>
                <p><strong>Date:</strong> {new Date(ticket.start_signature.signed_at || '').toLocaleString()}</p>
              </div>
              <img 
                src={ticket.start_signature.signature_image} 
                alt="Customer start signature"
                className="signature-image"
              />
            </div>
          )}
          
          {/* Show completion signature if it exists */}
          {ticket.signature ? (
            <div className="existing-signature">
              <h3>Job Completion Signature</h3>
              <div className="signature-info">
                <p><strong>Signed by:</strong> {ticket.signature.signed_by_name}</p>
                <p><strong>Date:</strong> {new Date(ticket.signature.signed_at || '').toLocaleString()}</p>
              </div>
              <img 
                src={ticket.signature.signature_image} 
                alt="Customer completion signature"
                className="signature-image"
              />
            </div>
          ) : (
            /* Show signature capture for Assigned (start) or In Progress (completion) */
            (ticket.status === 'Assigned' || (ticket.status === 'In Progress' && !ticket.signature)) && (
            <div className="signature-capture">
              {!showSignatureSection ? (
                <button
                  onClick={() => setShowSignatureSection(true)}
                  className="start-signature-btn"
                >
                  ✍️ {ticket.status === 'Assigned' ? 'Capture Start Signature' : 'Capture Completion Signature'}
                </button>
              ) : (
                <div className="signature-form">
                  <div className="signature-input">
                    <label htmlFor="customer-name">Customer Name:</label>
                    <input
                      id="customer-name"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer's full name"
                      className="customer-name-input"
                    />
                  </div>
                  
                  <div className="signature-pad-container">
                    <p>Please sign below:</p>
                    <SignaturePad
                      ref={signaturePadRef}
                      width={600}
                      height={200}
                      backgroundColor="#f8f9fa"
                      penColor="#000000"
                      penWidth={2}
                    />
                  </div>
                  
                  <div className="signature-actions">
                    <button
                      onClick={clearSignature}
                      className="clear-signature-btn"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setShowSignatureSection(false)}
                      className="cancel-signature-btn"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveSignature}
                      disabled={isSavingSignature || !customerName.trim()}
                      className="save-signature-btn"
                    >
                      {isSavingSignature ? 'Saving...' : 'Save Signature'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            )
          )}
        </section>
        )}
      </div>

      {/* QR Modal */}
      <QRModal 
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
      />
    </div>
  );
};

export default TicketDetailPage;