# GB Sales Machine - Project Documentation

## Project Overview
**Name:** GB Sales Machine  
**Type:** B2B Lead Generation & Cold Calling Automation Platform  
**Status:** In Development  
**Start Date:** January 2025  

### Executive Summary
GB Sales Machine is an automated B2B lead generation and cold calling system that helps businesses:
1. Analyze their website to understand their value proposition
2. Identify ideal target markets and decision makers
3. Scrape and validate high-quality leads
4. Optionally automate cold calling to book appointments

## Core Features

### 1. Website Analysis & Context Generation
- **Input:** Company website URL
- **Technology:** Google Gemini AI (2.5 Pro/Flash)
- **Output:** 
  - Business description and industry classification
  - Core value proposition extraction
  - Suggested sales targets (industries/niches)
  - Key decision-making roles to target
  - Editable summary for user refinement

### 2. Lead Generation System
- **Geo Scraping:** Google Maps Scraper via Apify
  - Keywords derived from target industries
  - Location-based parameters
  - Bulk lead extraction
- **Lead Validation:** Gemini AI scoring and qualification
- **Contact Research:** ContactOut integration for decision maker details
- **Pricing:** $4 per qualified lead

### 3. Sales Script Generation
- **Technology:** AI-powered script generation following best practices
- **Features:**
  - Customized scripts per decision maker role
  - Industry-specific language and pain points
  - VAPI-compatible format
  - A/B testing variations

### 4. Automated Cold Calling
- **Technology:** VAPI Voice AI
- **Features:**
  - Natural voice conversations
  - Dynamic script adaptation
  - Objection handling
  - Appointment scheduling
- **Pricing:** $7 per lead called + $3 per appointment booked
- **Calendar Integration:** Direct booking to user's calendar

## Technical Architecture

### Frontend Stack
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Context + Zustand
- **UI Components:** Radix UI + Custom components
- **Real-time Updates:** WebSockets/Server-Sent Events

### Backend Stack
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **API:** Next.js API Routes
- **Background Jobs:** Queue system for calls
- **File Storage:** Supabase Storage

### External Integrations
1. **Apify** - Google Maps scraping
2. **Google Gemini AI** - Business analysis and validation
3. **ContactOut** - Lead enrichment
4. **VAPI** - Voice AI calling
5. **Calendar APIs** - Google Calendar, Outlook

### Security & Compliance
- API key encryption
- Row Level Security (RLS) in Supabase
- TCPA compliance for calling
- GDPR/CCPA data handling
- SSL/TLS encryption

## Database Schema

### Core Tables
```sql
-- Users and authentication
users
- id (uuid, primary key)
- email
- full_name
- company_name
- created_at
- updated_at

-- Analyzed businesses
businesses
- id (uuid, primary key)
- user_id (foreign key)
- website_url
- business_name
- description
- value_proposition
- industry
- target_markets (jsonb)
- decision_maker_roles (jsonb)
- analysis_data (jsonb)
- created_at

-- Lead generation campaigns
campaigns
- id (uuid, primary key)
- business_id (foreign key)
- name
- status (active/paused/completed)
- search_parameters (jsonb)
- budget_limit
- leads_scraped
- leads_called
- appointments_booked
- created_at
- updated_at

-- Scraped and enriched leads
leads
- id (uuid, primary key)
- campaign_id (foreign key)
- business_name
- address
- phone
- website
- industry
- validation_score
- contact_name
- contact_title
- contact_email
- contact_phone
- enrichment_data (jsonb)
- status (new/validated/enriched/called/converted)
- created_at

-- VAPI call records
call_logs
- id (uuid, primary key)
- lead_id (foreign key)
- vapi_call_id
- duration_seconds
- outcome (no_answer/voicemail/completed/appointment)
- transcript
- recording_url
- cost
- created_at

-- Scheduled appointments
appointments
- id (uuid, primary key)
- lead_id (foreign key)
- call_log_id (foreign key)
- scheduled_time
- duration_minutes
- meeting_link
- notes
- status (scheduled/confirmed/completed/no_show)
- created_at

-- Sales scripts
sales_scripts
- id (uuid, primary key)
- business_id (foreign key)
- decision_maker_role
- script_type (first_message/system_prompt/objections)
- content
- version
- performance_metrics (jsonb)
- created_at
- updated_at

-- Usage and billing
billing_transactions
- id (uuid, primary key)
- user_id (foreign key)
- type (lead_scraped/lead_called/appointment_booked)
- amount
- credits_used
- related_id
- created_at
```

## User Flow

### 1. Onboarding
```
User Registration → Website URL Input → AI Analysis → 
Review/Edit Suggestions → Service Selection → Campaign Setup
```

### 2. Lead Generation
```
Configure Search Parameters → Run Scraping → AI Validation → 
Contact Enrichment → Review Leads → Select for Calling
```

### 3. Sales Automation
```
Generate Scripts → Configure VAPI → Launch Calls → 
Monitor Progress → Handle Appointments → Track Results
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Business Analysis
- `POST /api/analyze` - Analyze website
- `GET /api/businesses/:id` - Get business details
- `PUT /api/businesses/:id` - Update business info

### Campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns` - List campaigns
- `GET /api/campaigns/:id` - Get campaign details
- `PUT /api/campaigns/:id` - Update campaign
- `POST /api/campaigns/:id/start` - Start campaign
- `POST /api/campaigns/:id/pause` - Pause campaign

### Leads
- `GET /api/leads` - List leads with filters
- `GET /api/leads/:id` - Get lead details
- `POST /api/leads/validate` - Validate leads
- `POST /api/leads/enrich` - Enrich leads
- `PUT /api/leads/:id` - Update lead

### Calling
- `POST /api/calls/initiate` - Start VAPI call
- `GET /api/calls/:id` - Get call details
- `POST /api/calls/webhook` - VAPI webhook endpoint

### Scripts
- `POST /api/scripts/generate` - Generate scripts
- `GET /api/scripts` - List scripts
- `PUT /api/scripts/:id` - Update script

### Billing
- `GET /api/billing/usage` - Get usage stats
- `GET /api/billing/transactions` - List transactions
- `POST /api/billing/credits` - Add credits

## Development Phases

### Phase 1: Foundation (Week 1)
- [x] Project setup and planning
- [ ] Database schema implementation
- [ ] Authentication system
- [ ] Basic API structure
- [ ] Core service classes

### Phase 2: Lead Generation (Week 2)
- [ ] Website analysis with Gemini
- [ ] Apify integration
- [ ] Lead validation system
- [ ] ContactOut integration
- [ ] Lead management UI

### Phase 3: Sales Automation (Week 3)
- [ ] Script generation system
- [ ] VAPI integration
- [ ] Call management
- [ ] Appointment scheduling
- [ ] Calendar integration

### Phase 4: Frontend & Polish (Week 4)
- [ ] Complete UI implementation
- [ ] Real-time updates
- [ ] Testing and QA
- [ ] Performance optimization
- [ ] Documentation

## Agent Responsibilities

### PM (Project Manager)
- Overall project coordination
- Task assignment and tracking
- Documentation maintenance
- Sprint planning
- Quality assurance oversight

### BE (Backend Developer)
- Database schema and migrations
- API endpoint implementation
- Service layer architecture
- Background job processing
- Security implementation

### FE (Frontend Developer)
- Next.js application setup
- UI component development
- State management
- Real-time features
- Responsive design

### AP (API Expert)
- Apify integration
- ContactOut integration
- VAPI configuration
- Calendar API integration
- Webhook handling

### VP (VAPI Expert)
- Voice AI configuration
- Call flow optimization
- Script integration
- Performance monitoring
- Voice quality assurance

### AI (AI Expert)
- Gemini prompt engineering
- Lead scoring algorithms
- Script generation templates
- Response parsing
- AI performance optimization

### QA (Quality Assurance)
- Test suite development
- End-to-end testing
- Performance testing
- Security testing
- User acceptance testing

## Success Metrics

### Technical KPIs
- API response time < 200ms
- Page load time < 3s
- System uptime > 99.9%
- Error rate < 0.1%

### Business KPIs
- Website analysis accuracy > 90%
- Lead validation precision > 85%
- Call connection rate > 20%
- Appointment booking rate > 5%
- Cost per qualified lead < $10
- Customer satisfaction > 4.5/5

## Risk Management

### Technical Risks
- API rate limiting - Implement queuing and caching
- Data quality issues - Multiple validation layers
- Scaling challenges - Horizontal scaling architecture
- Integration failures - Fallback mechanisms

### Business Risks
- TCPA compliance - Legal review and opt-out systems
- Data privacy - Encryption and access controls
- Cost overruns - Usage limits and monitoring
- User adoption - Intuitive UI and onboarding

## Deployment Strategy

### Environment Setup
- Development: Local Docker environment
- Staging: Vercel Preview deployments
- Production: Vercel with Supabase cloud

### CI/CD Pipeline
- GitHub Actions for automated testing
- Preview deployments on PRs
- Automated security scanning
- Performance monitoring

## Monitoring & Maintenance

### Application Monitoring
- Error tracking with Sentry
- Performance monitoring with Vercel Analytics
- Custom metrics dashboard
- Real-time alerting

### Business Monitoring
- Usage analytics
- Cost tracking
- Success rate monitoring
- User feedback collection

## Future Enhancements
1. Multi-language support
2. SMS outreach integration
3. Email automation
4. CRM integrations
5. Advanced analytics dashboard
6. AI-powered follow-up sequences
7. Team collaboration features
8. White-label options

## Resources & Documentation
- [Sales Script Guidelines](./sales-script-guidelines.md)
- [API Documentation](./docs/api-reference.md)
- [Deployment Guide](./docs/deployment.md)
- [Agent Coordination Guide](./agents/shared/knowledge.md)

---

*Last Updated: January 2025*  
*Version: 1.0.0*  
*Maintained by: PM Agent & Development Team*