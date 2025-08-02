#!/bin/bash

# This script will start your GB Sales Machine app

echo "🚀 Starting GB Sales Machine..."
echo "================================"

# Change to the app directory
cd "$(dirname "$0")"

# Kill any existing processes on port 3000
echo "Cleaning up old processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Wait a moment
sleep 1

echo ""
echo "Starting the app..."
echo ""

# Start the development server
npm run dev &

# Wait for server to start
sleep 3

# Open the browser
echo ""
echo "✅ Opening your browser..."
open http://localhost:3000

echo ""
echo "================================"
echo "🎉 Your app should now be open in your browser!"
echo ""
echo "If the page doesn't load:"
echo "1. Wait 10 seconds and refresh the browser"
echo "2. Or manually go to: http://localhost:3000"
echo ""
echo "To stop the app: Press Ctrl+C"
echo "================================"

# Keep the terminal open
wait