import { test, expect } from '@playwright/test'

test.describe('Campaign Creation', () => {
  // Use a test user that's already registered
  const testUser = {
    email: 'test@example.com',
    password: 'TestPassword123!'
  }

  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/auth/login')
    await page.fill('input[name="email"]', testUser.email)
    await page.fill('input[name="password"]', testUser.password)
    await page.click('button[type="submit"]')
    
    // Wait for navigation
    await page.waitForURL('/dashboard')
  })

  test('user can create a new campaign with lead slider', async ({ page }) => {
    // Navigate to new campaign page
    await page.goto('/campaigns/new')

    // Fill campaign details
    await page.fill('input[placeholder*="Q1 2025"]', 'Test Campaign')
    
    // Test the lead slider
    const slider = page.locator('input[type="range"]')
    
    // Check initial value
    await expect(slider).toHaveValue('100')
    
    // Move slider to 250
    await slider.fill('250')
    await expect(page.locator('text=250 leads')).toBeVisible()
    
    // Add locations
    await page.fill('input[placeholder*="New York"]', 'New York, NY')
    await page.click('text=+ Add Another Location')
    await page.fill('input[placeholder*="New York"]:nth-of-type(2)', 'Los Angeles, CA')
    
    // Add keywords
    await page.fill('input[placeholder*="marketing agency"]', 'digital marketing')
    await page.click('text=+ Add Another Keyword')
    await page.fill('input[placeholder*="marketing agency"]:nth-of-type(2)', 'SEO agency')
    
    // Select service option
    await page.click('text=Lead Scraping Only')
    
    // Verify cost calculation
    await expect(page.locator('text=$1000.00')).toBeVisible() // 250 leads * $4
    
    // Switch to scraping + calling
    await page.click('text=Lead Scraping + Automated Calling')
    
    // Cost should update
    const costElement = page.locator('.text-3xl.font-bold.text-indigo-600')
    await expect(costElement).not.toHaveText('$1000.00')
    
    // Submit form
    await page.click('text=Create Campaign')
    
    // Should navigate to campaign detail page
    await expect(page).toHaveURL(/\/campaigns\/[a-f0-9-]+/)
  })

  test('lead slider updates cost in real-time', async ({ page }) => {
    await page.goto('/campaigns/new')
    
    const slider = page.locator('input[type="range"]')
    const costDisplay = page.locator('.text-3xl.font-bold.text-indigo-600')
    
    // Test different slider values
    const testValues = [
      { leads: 50, expectedCost: '$200.00' },
      { leads: 100, expectedCost: '$400.00' },
      { leads: 500, expectedCost: '$2000.00' },
      { leads: 1000, expectedCost: '$4000.00' }
    ]
    
    for (const { leads, expectedCost } of testValues) {
      await slider.fill(leads.toString())
      await expect(page.locator(`text=${leads} leads`)).toBeVisible()
      await expect(costDisplay).toHaveText(expectedCost)
    }
  })

  test('campaign form validates required fields', async ({ page }) => {
    await page.goto('/campaigns/new')
    
    // Try to submit without filling required fields
    await page.click('text=Create Campaign')
    
    // Check for HTML5 validation
    const nameInput = page.locator('input[placeholder*="Q1 2025"]')
    const validationMessage = await nameInput.evaluate((el: HTMLInputElement) => el.validationMessage)
    expect(validationMessage).toBeTruthy()
  })

  test('user can add and remove multiple locations and keywords', async ({ page }) => {
    await page.goto('/campaigns/new')
    
    // Add multiple locations
    await page.fill('input[placeholder*="New York"]', 'Location 1')
    await page.click('text=+ Add Another Location')
    await page.fill('input[placeholder*="New York"]:nth-of-type(2)', 'Location 2')
    await page.click('text=+ Add Another Location')
    await page.fill('input[placeholder*="New York"]:nth-of-type(3)', 'Location 3')
    
    // Remove middle location
    await page.click('button:has-text("Remove"):nth-of-type(1)')
    
    // Verify only 2 locations remain
    const locationInputs = page.locator('input[placeholder*="New York"]')
    await expect(locationInputs).toHaveCount(2)
    
    // Same for keywords
    await page.fill('input[placeholder*="marketing agency"]', 'Keyword 1')
    await page.click('text=+ Add Another Keyword')
    await page.fill('input[placeholder*="marketing agency"]:nth-of-type(2)', 'Keyword 2')
    
    // Verify we have 2 keyword inputs
    const keywordInputs = page.locator('input[placeholder*="marketing agency"]')
    await expect(keywordInputs).toHaveCount(2)
  })

  test('service option changes affect cost calculation', async ({ page }) => {
    await page.goto('/campaigns/new')
    
    // Set number of leads
    await page.locator('input[type="range"]').fill('100')
    
    // Select scraping only
    await page.click('text=Lead Scraping Only')
    await expect(page.locator('.text-3xl.font-bold.text-indigo-600')).toHaveText('$400.00')
    
    // Switch to scraping + calling
    await page.click('text=Lead Scraping + Automated Calling')
    
    // Cost should be higher (includes estimated calls and appointments)
    const newCost = await page.locator('.text-3xl.font-bold.text-indigo-600').textContent()
    const costValue = parseFloat(newCost!.replace('$', '').replace(',', ''))
    expect(costValue).toBeGreaterThan(400)
  })
})