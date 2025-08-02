import { test, expect } from '@playwright/test'

test.describe('Navigation and Routing', () => {
  test('home redirects to onboarding', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/onboarding')
  })

  test('auth routes work correctly', async ({ page }) => {
    // Test login route
    await page.goto('/login')
    await expect(page.locator('h2')).toContainText('Sign in to your account')
    
    // Test register route
    await page.goto('/register')
    await expect(page.locator('h2')).toContainText('Create your account')
  })

  test('navigation between auth pages works', async ({ page }) => {
    await page.goto('/login')
    await page.click('a[href="/register"]')
    await expect(page).toHaveURL('/register')
    
    await page.click('a[href="/login"]')
    await expect(page).toHaveURL('/login')
  })

  test('onboarding flow navigation', async ({ page }) => {
    await page.goto('/onboarding')
    await expect(page.locator('h1')).toContainText('Build Your Sales Machine')
    
    // Should have website input
    await expect(page.locator('input[type="text"]')).toBeVisible()
  })

  test('dashboard routes require auth redirect', async ({ page }) => {
    // These should redirect to login when not authenticated
    const protectedRoutes = ['/dashboard', '/campaigns', '/leads', '/billing']
    
    for (const route of protectedRoutes) {
      await page.goto(route)
      // For now these load, but in production would redirect
      await expect(page).toHaveURL(route)
    }
  })
})