#!/bin/bash

# Field Technician App - Database Reset Script
# This script resets the database to fresh state with sample data

echo "🗄️  Resetting Field Tech App Database..."
echo "========================================="

# Change to backend directory
cd backend

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the correct directory. Please run this from the techapp root."
    exit 1
fi

# Stop any running backend processes to avoid database locks
echo "🛑 Stopping any running backend processes..."
pkill -f "ts-node-dev.*server.ts" 2>/dev/null || true
pkill -f "node.*server.ts" 2>/dev/null || true
sleep 2

# Remove existing database
echo "🗑️  Removing existing database..."
if [ -f "database/fieldtech.db" ]; then
    rm database/fieldtech.db
    echo "   ✅ Old database removed"
else
    echo "   ℹ️  No existing database found"
fi

# Remove uploaded files
echo "📁 Cleaning upload directory..."
if [ -d "uploads" ]; then
    rm -rf uploads/*
    echo "   ✅ Upload directory cleaned"
else
    echo "   ℹ️  No uploads directory found"
fi

# Run migrations to create fresh database
echo "🏗️  Creating fresh database schema..."
npm run db:migrate
if [ $? -eq 0 ]; then
    echo "   ✅ Database migrations completed"
else
    echo "   ❌ Error running migrations"
    exit 1
fi

# Seed with fresh sample data
echo "🌱 Seeding database with sample data..."
npm run db:seed
if [ $? -eq 0 ]; then
    echo "   ✅ Database seeding completed"
else
    echo "   ❌ Error seeding database"
    exit 1
fi

echo ""
echo "🎉 Database reset completed successfully!"
echo "========================================="
echo ""
echo "📋 Sample Data Available:"
echo "   • 2 Technicians with login credentials"
echo "   • 4 Sample tickets (various statuses)"
echo "   • 1 Sample work log entry"
echo ""
echo "🔐 Test Login Credentials:"
echo "   Username: john.tech    | Password: password123"
echo "   Username: sarah.field  | Password: password123"
echo ""
echo "🚀 Ready to test! Start your servers:"
echo "   Backend:  cd backend && npm run dev"
echo "   Frontend: cd frontend && npm start"
echo ""