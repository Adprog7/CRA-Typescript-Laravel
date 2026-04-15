#!/bin/bash

# Script de démarrage - CRA Laravel Full Stack

echo ""
echo "====================================="
echo "CRA-Laravel Development Server Setup"
echo "====================================="
echo ""

# Check if we're in the right directory
if [ ! -d "back" ] || [ ! -d "front" ]; then
    echo "Error: Please run this script from the project root directory"
    echo "Expected structure: back/ and front/ folders"
    exit 1
fi

echo "Checking backend setup..."
cd back

# Check .env
if [ ! -f ".env" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

# Check node_modules
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Check database
if [ ! -f "database.sqlite" ]; then
    echo "Creating SQLite database..."
    touch database.sqlite
    php artisan migrate
fi

echo ""
echo "Backend setup complete!"
echo ""
echo "====================================="
echo ""
echo "Starting development servers..."
echo ""
echo "Frontend will be available at: http://localhost:3000"
echo "Backend API will be available at: http://localhost:8000/api"
echo ""
echo "Press Ctrl+C to stop all servers."
echo ""
echo "====================================="
echo ""

# Start the development servers
npm run dev:all
