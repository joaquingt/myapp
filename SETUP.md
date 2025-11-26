# Field Technician App - Setup Instructions

## 🚀 Quick Start Guide

This is a complete production-ready field technician application for tablet use. Follow these steps to get it running:

### Prerequisites

- **Node.js** 18+ and **npm** 8+
- **Git** (for version control)
- A modern web browser
- A tablet or large screen device for optimal experience

---

## 📦 Installation

### 1. Clone/Navigate to Project
```bash
cd /Users/jmendez/b2b/techapp
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## 🗄️ Database Setup

### 1. Create Database Schema
```bash
cd backend
npm run db:migrate
```

### 2. Seed Sample Data
```bash
npm run db:seed
```

This creates:
- **2 technicians** with login credentials
- **4 sample tickets** assigned to technicians
- **Sample work logs** and data for testing

---

## 🖥️ Running the Application

### 1. Start Backend Server (Terminal 1)
```bash
cd backend
npm run dev
```
**Backend will run on:** http://localhost:5000

### 2. Start Frontend App (Terminal 2)
```bash
cd frontend  
npm start
```
**Frontend will run on:** http://localhost:3000

---

## 🔐 Test Login Credentials

| Username | Password | Technician |
|----------|----------|------------|
| `john.tech` | `password123` | John Mitchell (Senior Technician) |
| `sarah.field` | `password123` | Sarah Johnson (Field Specialist) |

---

## 📱 Application Features

### Login Screen
- Username/password authentication
- Demo credentials displayed
- Tablet-optimized interface

### Dashboard
- Technician profile with photo and stats
- List of assigned tickets
- Filter by status (Assigned, In Progress, Completed, Signed)
- Click-to-call customer phone numbers

### Ticket Detail Screen
- Complete job information
- Work description logging
- Photo/video upload from tablet gallery
- Customer signature capture
- Automatic Google Reviews QR code after signing

---

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Technician login

### Technician Profile  
- `GET /api/technicians/me` - Get current technician

### Tickets
- `GET /api/tickets/my-tickets` - Get assigned tickets
- `GET /api/tickets/:id` - Get ticket details
- `POST /api/tickets/:id/work-log` - Save work description
- `POST /api/tickets/:id/media` - Upload photos/videos
- `POST /api/tickets/:id/signature` - Save customer signature

### QR Code
- `GET /api/qr/google-review` - Get Google Reviews QR code

---

## 📂 File Structure

```
techapp/
├── backend/                 # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── database/        # SQLite migrations and seeds
│   │   ├── middleware/      # Authentication middleware
│   │   ├── routes/         # API route handlers
│   │   ├── types/          # TypeScript type definitions
│   │   └── server.ts       # Express server setup
│   ├── package.json
│   └── .env                # Environment variables
│
├── frontend/               # React + TypeScript
│   ├── src/
│   │   ├── components/     # Reusable components (SignaturePad, QRModal)
│   │   ├── context/        # React Context (Authentication)
│   │   ├── pages/          # Main app pages
│   │   ├── services/       # API service layer
│   │   ├── types/          # TypeScript interfaces
│   │   └── App.tsx         # Main React app
│   └── package.json
│
└── README.md              # This file
```

---

## 🌐 Environment Configuration

### Backend (.env)
```bash
NODE_ENV=development
PORT=5000
DB_PATH=./database/fieldtech.db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
GOOGLE_REVIEW_URL=https://search.google.com/local/writereview?placeid=ChIJ4zh65TDHwoARD9qv25utrnk
```

### Frontend (proxy in package.json)
The frontend is configured to proxy API requests to the backend during development.

---

## 📱 Tablet Optimization

This app is specifically designed for tablet use:

- **Large touch targets** (48px minimum)
- **Responsive layouts** for portrait/landscape
- **Finger-friendly signature pad**
- **Large, clear fonts** (18px+ on tablets)
- **Optimized button spacing**
- **Full-screen QR modal** for easy scanning

---

## 🚀 Production Deployment

### Backend Deployment
1. **VPS/Server Setup**: Deploy to DigitalOcean, AWS, or similar
2. **Environment Variables**: Update .env for production
3. **Process Manager**: Use PM2 for process management
4. **Reverse Proxy**: Nginx for SSL and static file serving

### Frontend Deployment
1. **Build**: `npm run build` creates production files
2. **Static Hosting**: Deploy to Netlify, Vercel, or serve from backend
3. **API Configuration**: Update API_BASE_URL for production

### File Storage
- **Development**: Local `uploads/` folder
- **Production**: Consider AWS S3, CloudFlare R2, or similar

---

## 🐛 Troubleshooting

### Common Issues

1. **Database Not Found**: Run `npm run db:migrate` first
2. **Port Already in Use**: Change PORT in .env
3. **CORS Errors**: Check frontend proxy configuration
4. **File Upload Fails**: Verify upload directory permissions

### Development Tips

- **Backend logs**: Check terminal for API errors
- **Frontend debugging**: Use browser dev tools
- **Database inspection**: Use SQLite browser or CLI
- **File uploads**: Check `backend/uploads/` directory

---

## 📄 API Response Format

All API endpoints return JSON in this format:
```json
{
  "success": true|false,
  "data": {...},
  "error": "error message",
  "message": "success message"
}
```

---

## 🔐 Security Notes

- **JWT tokens** for authentication (24h expiration)
- **Input validation** on all endpoints
- **File type validation** for uploads
- **CORS protection** configured
- **Rate limiting** recommended for production

---

## 📞 Support

This is a self-contained application. Check:
1. **Console logs** for JavaScript errors
2. **Network tab** for API call failures  
3. **Database content** using SQLite tools
4. **File permissions** for upload directory

---

**🎉 Your field technician app is ready to use!**

Navigate to http://localhost:3000 and log in with the demo credentials to start testing all features.