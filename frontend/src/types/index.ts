export interface Technician {
  id: number;
  name: string;
  username: string;
  email: string;
  phone?: string;
  photo_url?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Ticket {
  id: number;
  ticket_number: string;
  technician_id: number;
  customer_name: string;
  customer_address: string;
  customer_phone?: string;
  job_location: string;
  work_to_do: string;
  scheduled_date: string;
  scheduled_time: string;
  status: 'Assigned' | 'In Progress' | 'Completed' | 'Signed';
  created_at?: string;
  updated_at?: string;
}

export interface TicketWorkLog {
  id: number;
  ticket_id: number;
  work_description: string;
  created_at?: string;
  updated_at?: string;
}

export interface TicketMedia {
  id: number;
  ticket_id: number;
  media_type: 'photo' | 'video';
  file_url: string;
  file_path: string;
  original_name?: string;
  file_size?: number;
  created_at?: string;
}

export interface TicketSignature {
  id: number;
  ticket_id: number;
  signed_by_name: string;
  signature_image: string;
  signed_at?: string;
}

export interface TicketDetails extends Ticket {
  work_log?: TicketWorkLog;
  media: TicketMedia[];
  signature?: TicketSignature;
  start_signature?: TicketSignature;
  technician?: Technician;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  technician: Technician;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface QRResponse {
  qr_code: string;
  review_url: string;
  message: string;
}