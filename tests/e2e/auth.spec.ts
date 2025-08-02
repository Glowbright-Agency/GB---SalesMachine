import { test, expect } from '@playwright/test'

const TEST_USER = {
  email: `test${Date.now()}@example.com`,
  password: 'TestPassword123!',
  fullName: 'Test User',
  companyName: 'Test Company'
}

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
  })

  test('user can register a new account', async ({ page }) => {
    // Navigate to registration
    await page.goto('/auth/register')
    
    // Fill registration form
    await page.fill('input[name="fullName"]', TEST_USER.fullName)
    await page.fill('input[name="companyName"]', TEST_USER.companyName)
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should redirect to onboarding
    await expect(page).toHaveURL('/onboarding')
  })

  test('user can login with valid credentials', async ({ page }) => {
    // First register a user
    await page.goto('/auth/register')
    await page.fill('input[name="fullName"]', TEST_USER.fullName)
    await page.fill('input[name="companyName"]', TEST_USER.companyName)
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    
    // Logout (if there's a logout button)
    await page.goto('/auth/logout')
    
    // Now test login
    await page.goto('/auth/login')
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
  })

  test('user cannot login with invalid credentials', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Try to login with invalid credentials
    await page.fill('input[name="email"]', 'invalid@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    // Should show error message
    await expect(page.locator('.text-red-800')).toBeVisible()
    
    // Should still be on login page
    await expect(page).toHaveURL('/auth/login')
  })

  test('registration form validates required fields', async ({ page }) => {
    await page.goto('/auth/register')
    
    // Try to submit empty form
    await page.click('button[type="submit"]')
    
    // Check HTML5 validation
    const emailInput = page.locator('input[name="email"]')
    const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage)
    expect(validationMessage).toBeTruthy()
  })

  test('login form shows/hides password', async ({ page }) => {
    await page.goto('/auth/login')
    
    const passwordInput = page.locator('input[name="password"]')
    
    // Password should be hidden by default
    await expect(passwordInput).toHaveAttribute('type', 'password')
    
    // Note: If you add a show/hide password toggle, test it here
  })

  test('user can navigate between login and register', async ({ page }) => {
    // Start at login
    await page.goto('/auth/login')
    
    // Click link to register
    await page.click('a[href="/auth/register"]')
    await expect(page).toHaveURL('/auth/register')
    
    // Click link back to login
    await page.click('a[href="/auth/login"]')
    await expect(page).toHaveURL('/auth/login')
  })
})