# Field Technician App

A production-ready, tablet-optimized web application for field technicians to manage jobs, capture work details, photos/videos, and customer signatures with integrated Google Reviews QR codes.

## Project Structure

```
techapp/
├── backend/          # Node.js + Express + TypeScript API server
├── frontend/         # React + TypeScript tablet app
└── README.md         # This file
```

## Quick Start

1. **Install Dependencies**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Setup Database**
   ```bash
   cd backend
   npm run db:migrate
   npm run db:seed
   ```

3. **Start Development Servers**

   **Easy Way (Recommended):**
   ```bash
   ./start.sh          # macOS/Linux
   start.bat           # Windows
   ```

   **Manual Way:**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev

   # Terminal 2 - Frontend
   cd frontend && npm start
   ```

4. **Access the App**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## 🔄 Reset Database (Fresh Testing)

To reset the database back to original sample data for fresh testing:

**macOS/Linux:**
```bash
./reset-database.sh
```

**Windows:**
```cmd
reset-database.bat
```

This will:
- Remove existing database and uploads
- Recreate fresh schema with sample data
- Reset all tickets to original state
- Stop backend processes to avoid conflicts

## 🎮 Server Management

**Start Both Servers:**
```bash
./start.sh          # macOS/Linux
start.bat           # Windows
```

**Stop Both Servers:**
```bash
./stop.sh           # macOS/Linux  
stop.bat            # Windows
```

**View Server Logs:**
```bash
tail -f logs/backend.log    # Backend logs
tail -f logs/frontend.log   # Frontend logs
```

## Test Accounts

- **Technician 1**: username: `john.tech`, password: `password123`
- **Technician 2**: username: `sarah.field`, password: `password123`

## Features

- ✅ Tablet-optimized responsive design
- ✅ Technician login and dashboard
- ✅ Job ticket management
- ✅ Work description logging
- ✅ Photo/video capture from tablet
- ✅ Customer signature capture
- ✅ Automatic Google Reviews QR code popup
- ✅ Complete audit trail in database

## Tech Stack

- **Frontend**: React 18 + TypeScript + React Router + Canvas for signatures
- **Backend**: Node.js + Express + TypeScript + SQLite
- **QR Codes**: qrcode library
- **File Upload**: Multer for media handling
- **Database**: SQLite with raw SQL migrations