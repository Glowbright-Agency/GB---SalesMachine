# GB SalesMachine - Shared Knowledge Base

## Project Overview
**Project**: GB SalesMachine
**Purpose**: Automated lead generation and outreach system
**Status**: Initial Setup Complete
**Last Updated**: 2025-01-08

## Agent Roster

| Agent | Role | Status | Specialization |
|-------|------|--------|----------------|
| FE | Front End Developer | ✅ Active | React, Next.js, UI/UX |
| BE | Back End Developer | ✅ Active | Node.js, APIs, Database |
| AP | API Expert | ✅ Active | External Integrations |
| VP | VAPI Expert | ✅ Active | Voice AI Configuration |
| QA | Quality Assurance | ✅ Active | Testing, Monitoring |
| PM | Project Manager | ✅ Active | Coordination, Documentation |
| AI | AI Expert | ✅ Active | Prompt Engineering, ML |

## System Architecture

### Tech Stack
- **Frontend**: Next.js 14, React, Tailwind CSS, TypeScript
- **Backend**: Node.js, Supabase (PostgreSQL)
- **APIs**: Apify, Google Gemini, ContactOut, VAPI
- **Testing**: Playwright, Jest, Vitest
- **Deployment**: Vercel, GitHub Actions

### Key Integrations
1. **Apify**: Google Maps scraping for lead generation
2. **Google Gemini**: AI-powered lead validation and content analysis
3. **ContactOut**: Lead enrichment with contact information
4. **VAPI**: Automated voice calling system
5. **Supabase**: Database and authentication

## Development Guidelines

### Code Standards
- TypeScript for type safety
- ESLint + Prettier for formatting
- Conventional commits
- 80% minimum test coverage
- Documentation for all public APIs

### Git Workflow
1. Feature branches from `develop`
2. PR reviews required
3. CI/CD checks must pass
4. Merge to `main` for production

### Communication Protocol
- Daily standups logged by PM
- Task assignments through orchestrator
- Knowledge sharing in this document
- Incident reports in logs/incidents/

## Common Patterns

### API Integration Pattern (AP)
```typescript
1. Create client with rate limiting
2. Add error handling and retries
3. Implement caching where appropriate
4. Create integration tests
5. Document endpoints
```

### Component Creation Pattern (FE)
```typescript
1. Create component with TypeScript interface
2. Add unit tests
3. Create Storybook story
4. Document props
5. Optimize for performance
```

### Database Schema Pattern (BE)
```sql
1. UUID primary keys
2. created_at/updated_at timestamps
3. Soft deletes where appropriate
4. Indexes on frequently queried fields
5. Foreign key constraints
```

## Key Decisions

### 2025-01-08: Agent System Architecture
- **Decision**: Implement 7 specialized agents
- **Rationale**: Separation of concerns, expertise focus
- **Impact**: Better code quality, clearer responsibilities

### 2025-01-08: Technology Choices
- **Decision**: Next.js + Supabase + VAPI stack
- **Rationale**: Modern, scalable, good DX
- **Impact**: Fast development, easy deployment

## Lessons Learned

### API Integration
- Always implement rate limiting
- Cache responses when possible
- Handle errors gracefully
- Document all endpoints

### Voice AI
- Test scripts with real users
- A/B test different voices
- Monitor call quality metrics
- Have fallback options

## Resources

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [VAPI Docs](https://docs.vapi.ai)
- [Next.js Docs](https://nextjs.org/docs)
- [Playwright Docs](https://playwright.dev)

### Internal Docs
- `/docs/architecture.md` - System design
- `/docs/api-reference.md` - API documentation
- `/docs/deployment.md` - Deployment guide

## Task Templates

### New Feature
1. PM creates task specification
2. BE designs API endpoints
3. FE creates UI components
4. AP integrates external services
5. AI optimizes prompts
6. QA writes tests
7. VP configures voice flows

### Bug Fix
1. QA identifies and documents bug
2. Relevant agent investigates
3. Fix implemented with tests
4. QA verifies fix
5. PM updates documentation

## Metrics & KPIs

### System Performance
- API response time < 200ms
- Page load time < 3s
- 99.9% uptime target
- Error rate < 0.1%

### Business Metrics
- Leads generated per day
- Lead quality score average
- Conversion rate
- Cost per qualified lead

---

*This knowledge base is maintained by all agents. Last update by: PM*