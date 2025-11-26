import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Ticket } from '../types';
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
  const { technician, logout } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getMyTickets();
      if (response.success && response.data) {
        setTickets(response.data);
      } else {
        setError(response.error || 'Failed to load tickets');
      }
    } catch (err) {
      setError('Failed to load tickets');
      console.error('Error fetching tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredTickets = () => {
    if (filterStatus === 'all') {
      return tickets;
    }
    return tickets.filter(ticket => ticket.status === filterStatus);
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

  const getStatusCount = (status: string): number => {
    if (status === 'all') return tickets.length;
    return tickets.filter(ticket => ticket.status === status).length;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string): string => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleTicketClick = (ticketId: number) => {
    // Navigate to ticket detail page
    navigate(`/ticket/${ticketId}`);
  };

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <h1>B2BGeeks</h1>
          </div>
          <div className="header-actions">
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Technician Profile Section */}
      <section className="technician-profile">
        <div className="profile-card">
          <div className="profile-avatar">
            {technician?.photo_url ? (
              <img src={technician.photo_url} alt={technician.name} />
            ) : (
              <div className="avatar-placeholder">
                {technician?.name?.charAt(0) || 'T'}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h2>{technician?.name}</h2>
            <p className="profile-role">{technician?.role || 'Field Technician'}</p>
            <p className="profile-email">{technician?.email}</p>
            {technician?.phone && (
              <p className="profile-phone">{technician.phone}</p>
            )}
          </div>
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-number">{tickets.length}</span>
              <span className="stat-label">Total Tickets</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {tickets.filter(t => t.status === 'Completed' || t.status === 'Signed').length}
              </span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tickets Section */}
      <section className="tickets-section">
        <div className="section-header">
          <h3>My Tickets</h3>
          <button className="refresh-btn" onClick={fetchTickets}>
            🔄 Refresh
          </button>
        </div>

        {/* Status Filter */}
        <div className="status-filter">
          <button 
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All ({getStatusCount('all')})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'Assigned' ? 'active' : ''}`}
            onClick={() => setFilterStatus('Assigned')}
          >
            Assigned ({getStatusCount('Assigned')})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'In Progress' ? 'active' : ''}`}
            onClick={() => setFilterStatus('In Progress')}
          >
            In Progress ({getStatusCount('In Progress')})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'Completed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('Completed')}
          >
            Completed ({getStatusCount('Completed')})
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'Signed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('Signed')}
          >
            Signed ({getStatusCount('Signed')})
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="error-message">
            <p>❌ {error}</p>
            <button onClick={fetchTickets} className="retry-btn">
              Try Again
            </button>
          </div>
        )}

        {/* Tickets List */}
        <div className="tickets-list">
          {getFilteredTickets().length === 0 ? (
            <div className="empty-state">
              <p>No tickets found</p>
              {filterStatus !== 'all' && (
                <button onClick={() => setFilterStatus('all')} className="show-all-btn">
                  Show All Tickets
                </button>
              )}
            </div>
          ) : (
            getFilteredTickets().map(ticket => (
              <div 
                key={ticket.id} 
                className="ticket-card"
                onClick={() => handleTicketClick(ticket.id)}
              >
                <div className="ticket-header">
                  <div className="ticket-number">#{ticket.ticket_number}</div>
                  <div className={`ticket-status ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </div>
                </div>
                
                <div className="ticket-content">
                  <h4 className="customer-name">{ticket.customer_name}</h4>
                  <p className="job-location">📍 {ticket.job_location}</p>
                  <p className="customer-address">{ticket.customer_address}</p>
                  
                  <div className="ticket-schedule">
                    <span className="schedule-date">
                      📅 {formatDate(ticket.scheduled_date)}
                    </span>
                    <span className="schedule-time">
                      🕐 {formatTime(ticket.scheduled_time)}
                    </span>
                  </div>
                  
                  <div className="work-description">
                    <p>{ticket.work_to_do}</p>
                  </div>
                </div>
                
                <div className="ticket-footer">
                  {ticket.customer_phone && (
                    <a 
                      href={`tel:${ticket.customer_phone}`} 
                      className="phone-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      📞 {ticket.customer_phone}
                    </a>
                  )}
                  <div className="ticket-arrow">→</div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;