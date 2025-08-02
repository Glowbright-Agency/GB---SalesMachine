# Project Reorganization Plan

## Current Issues
1. Files scattered in root directory
2. Inconsistent URL paths
3. Mixed file organization
4. No clear separation of concerns

## New Structure

### Phase 1: Create Folder Structure
```
src/
├── app/                       # Next.js App Router
│   ├── (auth)/               # Auth group
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/          # Dashboard group  
│   │   ├── dashboard/
│   │   ├── campaigns/
│   │   ├── leads/
│   │   ├── billing/
│   │   └── layout.tsx
│   ├── onboarding/           # Onboarding flow
│   │   ├── page.tsx
│   │   └── discovery/
│   └── api/                  # API routes
├── components/               # Reusable components
│   ├── ui/                  # Basic UI
│   ├── forms/               # Form components
│   └── layouts/             # Layouts
├── lib/                     # Libraries
│   ├── supabase/
│   └── utils/
├── services/                # Business logic
│   ├── ai/
│   ├── scrapers/
│   ├── enrichment/
│   └── voice/
└── types/                   # TypeScript types
```

### Phase 2: File Moves

#### Move to src/components/ui/:
- Loading components
- Button components
- Card components

#### Move to src/lib/utils/:
- Helper functions
- Constants
- Validation utilities

#### Move to src/types/:
- All TypeScript interfaces
- Type definitions

### Phase 3: Update Imports
- Update all import paths
- Use @ alias for src/
- Fix relative imports

### Phase 4: URL Structure
```
/                          → Landing (redirect to /onboarding)
/auth/login               → Login page
/auth/register            → Register page
/onboarding               → Website analysis
/onboarding/discovery     → 7 questions
/dashboard                → Main dashboard
/campaigns                → Campaign list
/campaigns/new            → Create campaign
/campaigns/[id]           → Campaign details
/leads                    → All leads
/billing                  → Billing/usage
```

### Phase 5: Testing
- Run all Playwright tests
- Verify no broken imports
- Check all routes work

## Execution Order
1. Create all folders
2. Move files systematically
3. Update imports in each file
4. Update routing
5. Test everything
6. Update documentation