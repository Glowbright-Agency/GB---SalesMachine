#!/bin/bash

echo "Starting GB Sales Machine development server..."
echo "========================================="

# Change to project directory
cd "$(dirname "$0")"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install --cache /tmp/npm-cache
fi

# Kill any existing processes on port 3000
echo "Checking for existing processes on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start the development server
echo "Starting Next.js development server..."
echo "Access the app at: http://localhost:3000"
echo ""
echo "If you see 'ERR_CONNECTION_REFUSED', try:"
echo "1. Open a new terminal window"
echo "2. Run: cd '/Users/federicocappuccilli/Desktop/GB - SalesMachine'"
echo "3. Run: npm run dev"
echo ""

# Set HOST to 0.0.0.0 to ensure it's accessible
HOST=0.0.0.0 npm run dev