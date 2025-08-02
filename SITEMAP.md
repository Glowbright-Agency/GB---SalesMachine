# GB Sales Machine - Sitemap

## Public Routes (No Auth Required)

### Landing & Onboarding
- `/` → Redirects to `/onboarding`
- `/onboarding` → Website URL input (Step 1)
- `/onboarding/discovery` → 7 Essential Questions (Step 2)

### Authentication
- `/login` → User login
- `/register` → User registration

## Protected Routes (Auth Required)

### Dashboard
- `/dashboard` → Main dashboard with stats

### Campaigns
- `/campaigns` → List all campaigns
- `/campaigns/new` → Create new campaign (Step 3)
- `/campaigns/[id]` → View/manage specific campaign
- `/campaigns/[id]/leads` → Campaign-specific leads

### Leads
- `/leads` → All leads across campaigns
- `/leads/[id]` → Individual lead details

### Billing
- `/billing` → Usage tracking and billing

### Settings (Future)
- `/settings` → Account settings
- `/settings/profile` → Profile management
- `/settings/api-keys` → API key management

## API Routes

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Business Analysis
- `POST /api/analyze` → Analyze website

### Campaigns
- `GET /api/campaigns` → List campaigns
- `POST /api/campaigns` → Create campaign
- `GET /api/campaigns/[id]` → Get campaign
- `PUT /api/campaigns/[id]` → Update campaign
- `POST /api/campaigns/[id]/scrape` → Start scraping

### Leads
- `GET /api/leads` → List leads
- `GET /api/leads/[id]` → Get lead
- `POST /api/leads/enrich` → Enrich leads
- `PUT /api/leads/[id]` → Update lead

### Calling
- `POST /api/calls/initiate` → Start calls
- `GET /api/calls/[id]` → Get call details

### Billing
- `GET /api/billing/usage` → Usage stats
- `GET /api/billing/transactions` → Transaction history

### Webhooks
- `POST /api/vapi/webhook` → VAPI webhook
- `POST /api/stripe/webhook` → Stripe webhook (future)

## User Flow

1. **New User Journey:**
   - `/` → `/onboarding` → `/onboarding/discovery` → `/register` → `/campaigns/new` → `/dashboard`

2. **Returning User Journey:**
   - `/` → `/login` → `/dashboard`

3. **Campaign Creation Flow:**
   - `/dashboard` → `/campaigns/new` → `/campaigns/[id]`

4. **Lead Management Flow:**
   - `/campaigns/[id]` → Scrape → Enrich → Call → `/leads`

## Folder Structure

```
src/app/
├── (auth)/               # Auth pages (no header)
│   ├── login/
│   └── register/
├── (dashboard)/          # Dashboard pages (with header)
│   ├── dashboard/
│   ├── campaigns/
│   ├── leads/
│   └── billing/
├── onboarding/          # Onboarding flow
│   └── discovery/
└── api/                 # API routes
```