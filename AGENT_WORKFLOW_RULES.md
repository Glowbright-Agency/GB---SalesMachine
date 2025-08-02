# Agent Workflow Rules - MANDATORY

## 🚨 CRITICAL: Always Follow This Workflow

### 1. INITIATE WITH PM AGENT
**EVERY task must start with PM agent:**
```
python3 agents/cli.py PM create_task_plan --data '{
  "task": "Description of what needs to be done",
  "requirements": "Specific requirements",
  "agents_needed": ["FE", "BE", "AP", "VP", "QA", "AI"]
}'
```

### 2. PM DELEGATES TO AGENTS
PM agent will:
- Break down the task into subtasks
- Assign each subtask to appropriate agents
- Create timeline and dependencies
- Monitor progress

### 3. AGENTS EXECUTE
Each agent performs their specialized tasks:
- **FE**: Frontend development
- **BE**: Backend/API development  
- **AP**: External API integrations
- **VP**: VAPI voice configuration
- **AI**: Prompt engineering
- **QA**: Testing with Playwright

### 4. QA VALIDATES
After implementation:
```
python3 agents/cli.py QA run_tests --data '{
  "feature": "feature_name",
  "test_type": "e2e"
}'
```

### 5. PM LOGS COMPLETION
PM agent creates final report:
```
python3 agents/cli.py PM log_completion --data '{
  "task_id": "TASK_ID",
  "status": "completed",
  "test_results": "QA_REPORT"
}'
```

## Example Workflow

### Task: "Reorganize project structure"

1. **PM Initiates:**
   - Creates reorganization plan
   - Identifies files to move
   - Assigns BE agent for structure changes
   - Assigns FE agent for import updates

2. **Agents Execute:**
   - BE: Moves files to proper folders
   - FE: Updates all import paths
   - QA: Creates tests for new structure

3. **QA Validates:**
   - Runs all tests
   - Verifies no broken imports
   - Checks application still works

4. **PM Completes:**
   - Documents new structure
   - Updates project documentation
   - Logs completion with test results

## Folder Structure Standards

```
GB-SalesMachine/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── (auth)/            # Auth pages group
│   │   ├── (dashboard)/       # Dashboard pages group
│   │   ├── api/               # API routes
│   │   └── ...
│   ├── components/            # Reusable components
│   │   ├── ui/               # Basic UI components
│   │   ├── forms/            # Form components
│   │   └── layouts/          # Layout components
│   ├── lib/                   # Utilities
│   │   ├── supabase/         # Database
│   │   └── utils/            # Helpers
│   ├── services/              # Business logic
│   │   ├── ai/               # AI services
│   │   ├── scrapers/         # Scraping services
│   │   ├── enrichment/       # Data enrichment
│   │   └── voice/            # Voice AI
│   └── types/                 # TypeScript types
├── public/                    # Static files
├── tests/                     # All tests
│   ├── e2e/                  # Playwright tests
│   └── unit/                 # Unit tests
├── docs/                      # Documentation
├── scripts/                   # Utility scripts
└── agents/                    # Agent system
```

## URL Path Standards

### Frontend Routes
- `/` → Home/Landing
- `/auth/login` → Login
- `/auth/register` → Register  
- `/onboarding` → Website analysis
- `/onboarding/discovery` → 7 questions
- `/dashboard` → Main dashboard
- `/campaigns` → Campaign list
- `/campaigns/[id]` → Campaign details
- `/campaigns/new` → Create campaign
- `/leads` → Lead management
- `/billing` → Billing/usage

### API Routes
- `/api/auth/*` → Authentication
- `/api/analyze` → Website analysis
- `/api/campaigns/*` → Campaign CRUD
- `/api/leads/*` → Lead operations
- `/api/calls/*` → Voice AI calls
- `/api/billing/*` → Billing/usage
- `/api/webhooks/*` → External webhooks

## Remember
- **NEVER** start coding without PM agent coordination
- **ALWAYS** end with QA validation
- **DOCUMENT** everything through PM agent
- **TEST** everything with Playwright

This is not optional - it's mandatory for code quality and project maintainability.