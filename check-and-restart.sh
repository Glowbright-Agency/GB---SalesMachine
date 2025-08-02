#!/bin/bash

echo "🔍 Checking for TypeScript errors..."

# Kill existing processes
pkill -f "next dev" 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Check TypeScript compilation
npx tsc --noEmit --skipLibCheck

if [ $? -eq 0 ]; then
    echo "✅ TypeScript check passed!"
    echo "🚀 Starting development server..."
    npm run dev
else
    echo "❌ TypeScript errors found! Please fix before starting server."
    exit 1
fi