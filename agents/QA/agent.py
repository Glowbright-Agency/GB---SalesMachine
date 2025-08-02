"""
Quality Assurance Agent (QA)
Handles testing, monitoring, and infrastructure quality
"""

from typing import Dict, List, Any
import json

class QAAgent:
    def __init__(self):
        self.name = "QA"
        self.role = "Quality Assurance & Testing Expert"
        self.test_types = ["unit", "integration", "e2e", "performance", "security"]
    
    def create_playwright_test(self, test_name: str, test_type: str) -> str:
        """Create Playwright test configuration"""
        if test_type == "e2e":
            return f"""
// tests/e2e/{test_name}.spec.ts
import {{ test, expect }} from '@playwright/test'

test.describe('{test_name} E2E Tests', () => {{
  test.beforeEach(async ({{ page }}) => {{
    await page.goto('http://localhost:3000')
  }})
  
  test('should complete full user journey', async ({{ page }}) => {{
    // Login
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    // Verify dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
    
    // Test main functionality
    await page.click('[data-testid="create-lead"]')
    await page.fill('[data-testid="business-name"]', 'Test Business')
    await page.click('[data-testid="submit"]')
    
    // Verify success
    await expect(page.locator('.success-message')).toBeVisible()
  }})
  
  test('should handle errors gracefully', async ({{ page }}) => {{
    // Test error scenarios
    await page.route('**/api/**', route => route.abort())
    await page.click('[data-testid="fetch-data"]')
    
    await expect(page.locator('.error-message')).toBeVisible()
    await expect(page.locator('.error-message')).toContainText('Failed to fetch')
  }})
}})
"""
        elif test_type == "api":
            return f"""
// tests/api/{test_name}.test.ts
import {{ test, expect }} from '@playwright/test'

test.describe('{test_name} API Tests', () => {{
  const baseURL = process.env.API_URL || 'http://localhost:3000/api'
  
  test('GET /api/{test_name} should return 200', async ({{ request }}) => {{
    const response = await request.get(`${{baseURL}}/{test_name}`)
    expect(response.ok()).toBeTruthy()
    
    const data = await response.json()
    expect(data).toHaveProperty('success', true)
  }})
  
  test('POST /api/{test_name} should create resource', async ({{ request }}) => {{
    const response = await request.post(`${{baseURL}}/{test_name}`, {{
      data: {{
        name: 'Test Resource',
        value: 123
      }}
    }})
    
    expect(response.status()).toBe(201)
    const created = await response.json()
    expect(created).toHaveProperty('id')
  }})
  
  test('should handle validation errors', async ({{ request }}) => {{
    const response = await request.post(`${{baseURL}}/{test_name}`, {{
      data: {{}} // Invalid data
    }})
    
    expect(response.status()).toBe(400)
    const error = await response.json()
    expect(error).toHaveProperty('error')
  }})
}})
"""
        else:
            return self._create_unit_test(test_name)
    
    def create_github_actions_workflow(self, workflow_type: str) -> str:
        """Create GitHub Actions CI/CD workflow"""
        workflows = {
            "ci": """
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type checking
        run: npm run typecheck
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Setup Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
          retention-days: 30
      
      - name: Code Coverage
        run: npm run coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
""",
            "deploy": """
name: Deploy Pipeline

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
"""
        }
        return workflows.get(workflow_type, workflows["ci"])
    
    def create_monitoring_setup(self) -> str:
        """Create monitoring and error tracking setup"""
        return """
// lib/monitoring.ts
import * as Sentry from "@sentry/nextjs"
import { metrics } from '@datadog/browser-rum'

// Sentry Configuration
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  debug: false,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request?.cookies) {
      delete event.request.cookies
    }
    return event
  }
})

// Custom error boundary
export function logError(error: Error, errorInfo?: any) {
  console.error('Application error:', error)
  
  Sentry.captureException(error, {
    contexts: {
      react: {
        componentStack: errorInfo?.componentStack
      }
    }
  })
  
  // Send to monitoring service
  metrics.send({
    name: 'application.error',
    tags: {
      error_type: error.name,
      component: errorInfo?.component
    }
  })
}

// Performance monitoring
export function measurePerformance(name: string, fn: () => Promise<any>) {
  const start = performance.now()
  
  return fn().finally(() => {
    const duration = performance.now() - start
    
    metrics.send({
      name: 'performance.measure',
      value: duration,
      tags: { operation: name }
    })
    
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${duration}ms`)
    }
  })
}
"""
    
    def create_test_data_factory(self) -> str:
        """Create test data factories"""
        return """
// tests/factories/index.ts
import { faker } from '@faker-js/faker'

export const factories = {
  lead: (overrides = {}) => ({
    id: faker.string.uuid(),
    business_name: faker.company.name(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    address: faker.location.streetAddress(),
    website: faker.internet.url(),
    rating: faker.number.float({ min: 1, max: 5, precision: 0.1 }),
    created_at: faker.date.recent(),
    ...overrides
  }),
  
  user: (overrides = {}) => ({
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    role: faker.helpers.arrayElement(['admin', 'user', 'viewer']),
    ...overrides
  }),
  
  callLog: (overrides = {}) => ({
    id: faker.string.uuid(),
    duration: faker.number.int({ min: 30, max: 600 }),
    outcome: faker.helpers.arrayElement(['interested', 'not-interested', 'callback', 'voicemail']),
    transcript: faker.lorem.paragraphs(3),
    sentiment: faker.helpers.arrayElement(['positive', 'neutral', 'negative']),
    created_at: faker.date.recent(),
    ...overrides
  })
}

// Seed database for testing
export async function seedTestData(supabase: any) {
  const leads = Array(50).fill(null).map(() => factories.lead())
  const { error } = await supabase.from('leads').insert(leads)
  
  if (error) {
    console.error('Failed to seed test data:', error)
    throw error
  }
  
  return leads
}
"""
    
    def create_performance_test(self) -> str:
        """Create performance testing setup"""
        return """
// tests/performance/load-test.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up more
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'],    // Error rate under 10%
  },
}

export default function () {
  // Test API endpoints
  const responses = {
    home: http.get('https://your-app.com'),
    api: http.get('https://your-app.com/api/leads'),
    search: http.get('https://your-app.com/api/search?q=test'),
  }
  
  // Check responses
  check(responses.home, {
    'home page status 200': (r) => r.status === 200,
    'home page load < 1s': (r) => r.timings.duration < 1000,
  })
  
  check(responses.api, {
    'api status 200': (r) => r.status === 200,
    'api response < 500ms': (r) => r.timings.duration < 500,
  })
  
  sleep(1)
}
"""
    
    def _create_unit_test(self, component_name: str) -> str:
        """Create a unit test template"""
        return f"""
// tests/unit/{component_name}.test.ts
import {{ describe, it, expect, vi }} from 'vitest'
import {{ render, screen, fireEvent }} from '@testing-library/react'
import {{ {component_name} }} from '@/components/{component_name}'

describe('{component_name}', () => {{
  it('should render correctly', () => {{
    render(<{component_name} />)
    expect(screen.getByTestId('{component_name.lower()}')).toBeInTheDocument()
  }})
  
  it('should handle user interactions', async () => {{
    const mockHandler = vi.fn()
    render(<{component_name} onClick={{mockHandler}} />)
    
    const element = screen.getByTestId('{component_name.lower()}')
    fireEvent.click(element)
    
    expect(mockHandler).toHaveBeenCalledTimes(1)
  }})
  
  it('should display correct data', () => {{
    const testData = {{ name: 'Test', value: 123 }}
    render(<{component_name} data={{testData}} />)
    
    expect(screen.getByText('Test')).toBeInTheDocument()
    expect(screen.getByText('123')).toBeInTheDocument()
  }})
}})
"""