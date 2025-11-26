#!/bin/bash

# Field Technician App - Stop Script
# This script stops both backend and frontend servers

echo "🛑 Stopping Field Tech App..."
echo "============================="

# Function to stop a process by PID file
stop_process() {
    local service_name=$1
    local pid_file=$2
    
    if [ -f "$pid_file" ]; then
        PID=$(cat "$pid_file")
        
        if ps -p $PID > /dev/null; then
            echo "🛑 Stopping $service_name (PID: $PID)..."
            kill $PID
            
            # Wait up to 10 seconds for graceful shutdown
            for i in {1..10}; do
                if ! ps -p $PID > /dev/null; then
                    echo "   ✅ $service_name stopped successfully"
                    break
                fi
                sleep 1
            done
            
            # Force kill if still running
            if ps -p $PID > /dev/null; then
                echo "   ⚠️  Force killing $service_name..."
                kill -9 $PID
                sleep 1
                if ! ps -p $PID > /dev/null; then
                    echo "   ✅ $service_name force stopped"
                else
                    echo "   ❌ Failed to stop $service_name"
                fi
            fi
        else
            echo "ℹ️  $service_name was not running"
        fi
        
        # Remove PID file
        rm -f "$pid_file"
    else
        echo "ℹ️  No $service_name PID file found"
    fi
}

# Stop processes using PID files
if [ -d "logs" ]; then
    stop_process "Backend" "logs/backend.pid"
    stop_process "Frontend" "logs/frontend.pid"
fi

# Also kill any remaining processes by pattern matching
echo "🧹 Cleaning up any remaining processes..."

# Kill any ts-node-dev processes (backend)
pkill -f "ts-node-dev.*server.ts" 2>/dev/null && echo "   ✅ Stopped remaining backend processes"

# Kill any react-scripts processes (frontend)  
pkill -f "react-scripts.*start" 2>/dev/null && echo "   ✅ Stopped remaining frontend processes"

# Kill any node processes on specific ports
lsof -ti:5001 2>/dev/null | xargs kill -9 2>/dev/null && echo "   ✅ Freed port 5001"
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null && echo "   ✅ Freed port 3000"

echo ""
echo "🎉 Field Tech App Stopped Successfully!"
echo "======================================"
echo ""
echo "📊 All servers and processes stopped"
echo "🔓 Ports 3000 and 5001 are now available"
echo ""
echo "🚀 To start again: ./start.sh"
echo "🗄️  To reset database: ./reset-database.sh"
echo ""