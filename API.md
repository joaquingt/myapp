# Field Technician App - API Documentation

## 🔗 Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://yourdomain.com/api`

## 🔐 Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 📋 API Endpoints

### 🔐 Authentication

#### POST /auth/login
Login with username and password.

**Request:**
```json
{
  "username": "john.tech",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "technician": {
      "id": 1,
      "name": "John Mitchell",
      "username": "john.tech",
      "email": "john.mitchell@fieldtech.com",
      "phone": "(555) 123-4567",
      "photo_url": "/images/john-photo.jpg",
      "role": "Senior Technician"
    }
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "error": "Invalid username or password"
}
```

---

### 👤 Technician Profile

#### GET /technicians/me
Get current logged-in technician's profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Mitchell",
    "username": "john.tech",
    "email": "john.mitchell@fieldtech.com", 
    "phone": "(555) 123-4567",
    "photo_url": "/images/john-photo.jpg",
    "role": "Senior Technician"
  }
}
```

---

### 🎫 Tickets

#### GET /tickets/my-tickets
Get all tickets assigned to the current technician.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ticket_number": "FT-2024-001",
      "customer_name": "Acme Corporation",
      "customer_address": "123 Business Ave, Suite 100, San Francisco, CA 94105",
      "customer_phone": "(415) 555-0123",
      "job_location": "123 Business Ave, Suite 100, San Francisco, CA 94105",
      "work_to_do": "Install new fiber optic network infrastructure",
      "scheduled_date": "2024-11-25",
      "scheduled_time": "09:00",
      "status": "Assigned",
      "created_at": "2024-11-22T10:00:00Z",
      "updated_at": "2024-11-22T10:00:00Z"
    }
  ]
}
```

#### GET /tickets/:id
Get detailed information for a specific ticket.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "ticket_number": "FT-2024-001",
    "customer_name": "Acme Corporation",
    "customer_address": "123 Business Ave, Suite 100, San Francisco, CA 94105",
    "customer_phone": "(415) 555-0123",
    "job_location": "123 Business Ave, Suite 100, San Francisco, CA 94105",
    "work_to_do": "Install new fiber optic network infrastructure",
    "scheduled_date": "2024-11-25", 
    "scheduled_time": "09:00",
    "status": "In Progress",
    "technician": {
      "id": 1,
      "name": "John Mitchell",
      "email": "john.mitchell@fieldtech.com",
      "phone": "(555) 123-4567",
      "photo_url": "/images/john-photo.jpg",
      "role": "Senior Technician"
    },
    "work_log": {
      "id": 1,
      "work_description": "Completed cable installation...",
      "created_at": "2024-11-25T09:30:00Z",
      "updated_at": "2024-11-25T10:15:00Z"
    },
    "media": [
      {
        "id": 1,
        "media_type": "photo",
        "file_url": "/uploads/abc123.jpg",
        "original_name": "cable_installation.jpg",
        "file_size": 2048576,
        "created_at": "2024-11-25T10:00:00Z"
      }
    ],
    "signature": {
      "id": 1,
      "signed_by_name": "John Smith",
      "signature_image": "data:image/png;base64,iVBORw0KGgoAAAANS...",
      "signed_at": "2024-11-25T11:00:00Z"
    }
  }
}
```

---

### 📝 Work Logs

#### POST /tickets/:id/work-log
Create or update work log for a ticket.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "work_description": "Arrived on site at 9:00 AM. Completed fiber optic cable installation in server room. Configured network switches and tested all connections. All systems operational."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "ticket_id": 1,
    "work_description": "Arrived on site at 9:00 AM...",
    "created_at": "2024-11-25T09:30:00Z",
    "updated_at": "2024-11-25T10:15:00Z"
  },
  "message": "Work log saved successfully"
}
```

---

### 📷 Media Upload

#### POST /tickets/:id/media
Upload photos or videos for a ticket.

**Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`

**Request:** Form data with files
```
files: [File, File, ...]
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "ticket_id": 1,
      "media_type": "photo",
      "file_url": "/uploads/abc123.jpg",
      "file_path": "/path/to/uploads/abc123.jpg",
      "original_name": "installation_photo.jpg",
      "file_size": 2048576,
      "created_at": "2024-11-25T10:00:00Z"
    }
  ],
  "message": "2 file(s) uploaded successfully"
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "Invalid file type. Only images and videos are allowed."
}
```

---

### ✍️ Signatures

#### POST /tickets/:id/signature
Save customer signature and mark ticket as signed.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "signed_by_name": "John Smith",
  "signature_image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "ticket_id": 1,
    "signed_by_name": "John Smith",
    "signature_image": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "signed_at": "2024-11-25T11:00:00Z"
  },
  "message": "Customer signature saved successfully"
}
```

---

### 📱 QR Code Generation

#### GET /qr/google-review
Generate QR code for Google Reviews (no authentication required).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...",
    "review_url": "https://search.google.com/local/writereview?placeid=ChIJ4zh65TDHwoARD9qv25utrnk",
    "message": "Please scan this QR code or click the link to leave us a review on Google!"
  }
}
```

---

## 🛡️ Error Responses

### Common HTTP Status Codes

- **200**: Success
- **400**: Bad Request (invalid input)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (valid token, insufficient permissions)
- **404**: Not Found (resource doesn't exist)
- **500**: Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "error": "Descriptive error message",
  "message": "Additional context (optional)"
}
```

---

## 📊 Data Models

### Technician
```typescript
interface Technician {
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
```

### Ticket
```typescript
interface Ticket {
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
```

### Work Log
```typescript
interface TicketWorkLog {
  id: number;
  ticket_id: number;
  work_description: string;
  created_at?: string;
  updated_at?: string;
}
```

### Media
```typescript
interface TicketMedia {
  id: number;
  ticket_id: number;
  media_type: 'photo' | 'video';
  file_url: string;
  file_path: string;
  original_name?: string;
  file_size?: number;
  created_at?: string;
}
```

### Signature
```typescript
interface TicketSignature {
  id: number;
  ticket_id: number;
  signed_by_name: string;
  signature_image: string; // base64 data URL
  signed_at?: string;
}
```

---

## 🔧 Implementation Notes

### File Upload Constraints
- **Max file size**: 10MB per file
- **Allowed types**: JPEG, PNG, GIF images; MP4, QuickTime videos
- **Storage**: Local filesystem (`/uploads` directory)

### JWT Token
- **Expiration**: 24 hours
- **Algorithm**: HS256
- **Payload**: `{ technicianId: number }`

### Database
- **Type**: SQLite
- **Location**: `backend/database/fieldtech.db`
- **Relationships**: Foreign key constraints enforced

### QR Code
- **Format**: PNG image as base64 data URL
- **Size**: 256x256 pixels
- **Error correction**: Medium level
- **Content**: Google Reviews URL with place ID

---

This API provides complete functionality for field technician job management, work logging, media capture, and customer signature collection with integrated Google Reviews.