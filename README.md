# GB SalesMachine 🚀

An automated lead generation and outreach system that combines web scraping, AI validation, and voice calling.

## Quick Start

### 1. Initial Setup (One-time only)
```bash
npm run setup
```

### 2. Create Database Tables
```bash
npm run setup-db
```

### 3. Start Scraping Leads
```bash
npm run scrape --query "restaurants" --location "New York, NY" --max 50
```

## Features

- 🔍 **Google Maps Scraping**: Automatically find businesses
- 🤖 **AI Validation**: Uses Google Gemini to validate leads
- 📞 **Voice Calling**: Automated calls with VAPI
- 💾 **Database Storage**: All data stored in Supabase
- 📊 **Lead Enrichment**: Get contact details with ContactOut

## Common Commands

### Scrape Different Business Types
```bash
# Restaurants
npm run scrape -- --query "restaurants" --location "Los Angeles, CA" --max 100

# Dentists
npm run scrape -- --query "dentists" --location "Chicago, IL" --max 50

# Real Estate Agents
npm run scrape -- --query "real estate agents" --location "Miami, FL" --max 75
```

## API Keys Status

All your API keys are stored in:
- `.env` file (for the application)
- `API_KEYS.md` (for reference - DO NOT share this file!)

## Need Help?

- Check the `docs/` folder for detailed guides
- Run commands with `--help` flag for options
- All data is stored in your Supabase database