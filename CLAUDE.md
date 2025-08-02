# GB Sales Machine - Claude Development Guide

## Project Overview
GB Sales Machine is an automated B2B lead generation and cold calling platform that helps businesses analyze their value proposition, find qualified leads, and optionally cold call them using AI voice technology.

## Quick Commands
- **Run tests**: `npm run test:e2e`
- **Start development**: `npm run dev`
- **Lint code**: `npm run lint`
- **Type check**: `npm run typecheck`
- **Use agents**: `npm run agent [AGENT_NAME] [ACTION]`

## Key Features
1. **Website Analysis**: Uses Gemini AI to analyze business websites and extract value propositions
2. **Lead Scraping**: Apify Google Maps integration for finding businesses
3. **Lead Enrichment**: ContactOut integration for decision maker details
4. **Automated Calling**: VAPI voice AI for cold calling with GPT-4o
5. **Appointment Booking**: Automated scheduling from successful calls

## Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **AI**: Google Gemini (analysis), GPT-4o via VAPI (calling)
- **Testing**: Playwright for E2E tests

## API Integrations
- **Apify**: Google Maps scraping (`APIFY_API_KEY`)
- **Google Gemini**: Business analysis (`GOOGLE_GEMINI_API_KEY`)
- **ContactOut**: Lead enrichment (`CONTACTOUT_API_KEY`)
- **VAPI**: Voice AI calling (`VAPI_API_KEY`)
- **Supabase**: Database and auth (`SUPABASE_URL`, `SUPABASE_ANON_KEY`)

## Database Schema
Key tables:
- `users`: User accounts and credits
- `businesses`: Analyzed business profiles
- `campaigns`: Lead generation campaigns
- `leads`: Scraped and enriched leads
- `call_logs`: VAPI call records
- `appointments`: Scheduled meetings
- `billing_transactions`: Usage tracking

## Pricing Model
- Lead Scraping: $4/lead
- Contact Enrichment: $2/lead
- Automated Calling: $7/call
- Appointment Booking: $3/appointment

## Agent System
The project uses 7 specialized agents:
- **FE**: Frontend development (React/Next.js)
- **BE**: Backend development (APIs, database)
- **AP**: API integrations
- **VP**: VAPI voice AI configuration
- **QA**: Testing with Playwright
- **PM**: Project management
- **AI**: Prompt engineering

Use agents via: `python3 agents/cli.py [AGENT] [ACTION]`

## Important Notes
- VAPI uses GPT-4o for best performance
- Users can adjust lead count with a slider (10-1000)
- All API calls require authentication
- Row Level Security (RLS) is enabled on all tables
- TCPA compliance is critical for calling features

## Development Workflow
1. Always write Playwright tests for new features
2. Use the appropriate agent for specialized tasks
3. Run lint and type checks before committing
4. Update this file with important project changes

## Common Tasks

### Add a new API endpoint
```typescript
// src/app/api/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET/POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Implementation
}
```

### Create a new database table
1. Add migration in `supabase/migrations/`
2. Include RLS policies
3. Update TypeScript types
4. Add indexes for performance

### Test with Playwright
```bash
npm run test:e2e -- --grep "test name"
```

## Troubleshooting
- **npm permission issues**: Use `npm install --cache /tmp/npm-cache`
- **VAPI webhook issues**: Check `/api/vapi/webhook` logs
- **Supabase auth issues**: Verify RLS policies

## Future Enhancements
- Multi-language support
- SMS integration
- Email automation
- CRM integrations
- Advanced analytics

---
*Last updated: January 2025*