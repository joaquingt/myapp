import { 
  LoginRequest, 
  AuthResponse, 
  ApiResponse, 
  Technician, 
  Ticket, 
  TicketDetails, 
  TicketWorkLog,
  TicketMedia,
  TicketSignature,
  QRResponse
} from '../types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' // Will use same domain in production
  : process.env.REACT_APP_API_URL || 'http://localhost:5001/api'; // Development

class ApiService {
  private getAuthHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const authToken = token || localStorage.getItem('fieldtech_token');
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('fieldtech_token');
        localStorage.removeItem('fieldtech_technician');
        window.location.href = '/login';
      }
      
      const errorData = await response.json().catch(() => ({
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      }));
      
      throw new Error(errorData.error || 'Network error');
    }

    return response.json();
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(credentials),
    });

    return this.handleResponse<AuthResponse>(response);
  }

  // Technician Profile
  async getTechnicianProfile(token: string): Promise<ApiResponse<Technician>> {
    const response = await fetch(`${API_BASE_URL}/technicians/me`, {
      headers: this.getAuthHeaders(token),
    });

    return this.handleResponse<Technician>(response);
  }

  // Tickets
  async getMyTickets(): Promise<ApiResponse<Ticket[]>> {
    const response = await fetch(`${API_BASE_URL}/tickets/my-tickets`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<Ticket[]>(response);
  }

  async getTicketDetails(ticketId: number): Promise<ApiResponse<TicketDetails>> {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<TicketDetails>(response);
  }

  // Work Log
  async saveWorkLog(ticketId: number, workDescription: string): Promise<ApiResponse<TicketWorkLog>> {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/work-log`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ work_description: workDescription }),
    });

    return this.handleResponse<TicketWorkLog>(response);
  }

  // Media Upload
  async uploadMedia(ticketId: number, files: FileList): Promise<ApiResponse<TicketMedia[]>> {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    const authToken = localStorage.getItem('fieldtech_token');
    const headers: HeadersInit = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/media`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return this.handleResponse<TicketMedia[]>(response);
  }

  // Signature
  async saveSignature(
    ticketId: number, 
    signedByName: string, 
    signatureImage: string,
    signatureType: 'start' | 'completion' = 'completion'
  ): Promise<ApiResponse<TicketSignature>> {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/signature`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        signed_by_name: signedByName,
        signature_image: signatureImage,
        signature_type: signatureType,
      }),
    });

    return this.handleResponse<TicketSignature>(response);
  }

  // Ticket Status Update
  async updateTicketStatus(ticketId: number, status: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    return this.handleResponse<any>(response);
  }

  // QR Code
  async getGoogleReviewQR(): Promise<ApiResponse<QRResponse>> {
    const response = await fetch(`${API_BASE_URL}/qr/google-review`);
    return this.handleResponse<QRResponse>(response);
  }
}

export const apiService = new ApiService();