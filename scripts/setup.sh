#!/bin/bash

echo "🚀 GB SalesMachine Setup Script"
echo "================================"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with your API keys"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --cache /tmp/npm-cache
python3 -m pip install -r requirements.txt --user

# Setup VAPI
echo "🎤 Setting up VAPI..."
if ! command -v vapi &> /dev/null; then
    echo "Installing VAPI CLI..."
    curl -sSL https://vapi.ai/install.sh | bash
    source ~/.zshrc
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run 'npm run setup-db' to create database tables"
echo "2. Run 'npm run scrape' to start scraping leads"
echo "3. Run 'npm run validate' to validate leads with AI"