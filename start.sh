#!/bin/bash

# Field Technician App - Start Script
# This script starts both backend and frontend servers

echo "🚀 Starting Field Tech App..."
echo "==============================="

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Not in the correct directory. Please run this from the techapp root."
    exit 1
fi

# Create log directory
mkdir -p logs

# Function to start backend
start_backend() {
    echo "🔧 Starting Backend Server..."
    cd backend
    
    # Check if backend dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing backend dependencies..."
        npm install
    fi
    
    # Start backend in background and save PID
    PORT=5001 npm run dev > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../logs/backend.pid
    
    # Wait a moment for backend to start
    sleep 3
    
    # Check if backend is running
    if ps -p $BACKEND_PID > /dev/null; then
        echo "   ✅ Backend started on port 5001 (PID: $BACKEND_PID)"
    else
        echo "   ❌ Backend failed to start"
        return 1
    fi
    
    cd ..
}

# Function to start frontend
start_frontend() {
    echo "🎨 Starting Frontend Server..."
    cd frontend
    
    # Check if frontend dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing frontend dependencies..."
        npm install
    fi
    
    # Start frontend in background and save PID
    DANGEROUSLY_DISABLE_HOST_CHECK=true HOST=0.0.0.0 WDS_SOCKET_HOST=10.106.6.21 REACT_APP_API_URL=http://10.106.6.21:5001/api npm start > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../logs/frontend.pid
    
    # Wait a moment for frontend to start
    sleep 5
    
    # Check if frontend is running
    if ps -p $FRONTEND_PID > /dev/null; then
        echo "   ✅ Frontend started on port 3000 (PID: $FRONTEND_PID)"
    else
        echo "   ❌ Frontend failed to start"
        return 1
    fi
    
    cd ..
}

# Function to check if servers are already running
check_running() {
    BACKEND_RUNNING=false
    FRONTEND_RUNNING=false
    
    if [ -f "logs/backend.pid" ]; then
        BACKEND_PID=$(cat logs/backend.pid)
        if ps -p $BACKEND_PID > /dev/null; then
            BACKEND_RUNNING=true
            echo "ℹ️  Backend already running (PID: $BACKEND_PID)"
        fi
    fi
    
    if [ -f "logs/frontend.pid" ]; then
        FRONTEND_PID=$(cat logs/frontend.pid)
        if ps -p $FRONTEND_PID > /dev/null; then
            FRONTEND_RUNNING=true
            echo "ℹ️  Frontend already running (PID: $FRONTEND_PID)"
        fi
    fi
}

# Main execution
check_running

# Start backend if not running
if [ "$BACKEND_RUNNING" = false ]; then
    start_backend
    if [ $? -ne 0 ]; then
        echo "❌ Failed to start backend. Check logs/backend.log for details."
        exit 1
    fi
fi

# Start frontend if not running
if [ "$FRONTEND_RUNNING" = false ]; then
    start_frontend
    if [ $? -ne 0 ]; then
        echo "❌ Failed to start frontend. Check logs/frontend.log for details."
        exit 1
    fi
fi

echo ""
echo "🎉 Field Tech App Started Successfully!"
echo "======================================"
echo ""
echo "📊 Server Status:"
echo "   Backend:  http://localhost:5001 ✅"
echo "   Frontend: http://localhost:3000 ✅"
echo "   API Health: http://localhost:5001/api/health"
echo ""
echo "🌐 Network Access:"
echo "   Frontend: http://10.106.6.21:3000"
echo "   Backend:  http://10.106.6.21:5001"
echo ""
echo "🔐 Test Login Credentials:"
echo "   Username: john.tech    | Password: password123"
echo "   Username: sarah.field  | Password: password123"
echo ""
echo "📝 Useful Commands:"
echo "   Stop servers:  ./stop.sh"
echo "   View logs:     tail -f logs/backend.log"
echo "                  tail -f logs/frontend.log"
echo "   Reset DB:      ./reset-database.sh"
echo ""
echo "🌐 Open http://localhost:3000 to use the app!"
echo ""