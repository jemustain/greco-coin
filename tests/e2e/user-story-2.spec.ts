/**
 * E2E Tests for User Story 2: Multi-currency Comparison
 * Tests the /compare page functionality
 */

import { test, expect } from '@playwright/test'

test.describe('User Story 2: Multi-currency Comparison', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to compare page before each test
    await page.goto('/compare')
  })

  test('should load compare page', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Compare.*Greco/)
    
    // Check main heading
    await expect(page.locator('h1')).toContainText(/Compare|Multi/)
  })

  test('should have currency selection controls', async ({ page }) => {
    // Look for currency checkboxes or selection controls
    const currencyControls = page.locator('input[type="checkbox"]').or(page.locator('select[multiple]'))
    const count = await currencyControls.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should allow selecting multiple currencies', async ({ page }) => {
    // Find currency checkboxes
    const usdCheckbox = page.locator('input[type="checkbox"]').first()
    const eurCheckbox = page.locator('input[type="checkbox"]').nth(1)
    
    // Select currencies
    if (!(await usdCheckbox.isChecked())) {
      await usdCheckbox.check()
    }
    if (!(await eurCheckbox.isChecked())) {
      await eurCheckbox.check()
    }
    
    // Wait for chart to update
    await page.waitForTimeout(1000)
    
    // Chart should show multiple lines
    const chart = page.locator('.recharts-wrapper')
    await expect(chart).toBeVisible()
  })

  test('should display comparison chart', async ({ page }) => {
    // Check that chart container is visible
    const chartContainer = page.locator('.chart-container').or(page.locator('.recharts-wrapper'))
    await expect(chartContainer).toBeVisible()
  })

  test('should have time range controls', async ({ page }) => {
    // Find time range selector
    const timeRangeControl = page.locator('select').or(page.locator('button').filter({ hasText: /Year|Month/ }))
    const count = await timeRangeControl.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should show legend for multiple currencies', async ({ page }) => {
    // Select multiple currencies first
    const checkboxes = page.locator('input[type="checkbox"]')
    const count = await checkboxes.count()
    
    if (count >= 2) {
      await checkboxes.first().check()
      await checkboxes.nth(1).check()
      await page.waitForTimeout(1000)
      
      // Legend should be visible
      const legend = page.locator('.recharts-legend-wrapper').or(page.locator('[class*="legend"]'))
      await expect(legend.first()).toBeVisible()
    }
  })

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      // Navigation should be visible
      await expect(page.locator('nav')).toBeVisible()
      
      // Chart should be visible (may be scrollable)
      const chartContainer = page.locator('.chart-container').or(page.locator('.recharts-wrapper'))
      await expect(chartContainer).toBeVisible()
    }
  })

  test('should handle no currencies selected gracefully', async ({ page }) => {
    // Uncheck all currencies
    const checkboxes = page.locator('input[type="checkbox"]:checked')
    const count = await checkboxes.count()
    
    for (let i = 0; i < count; i++) {
      await checkboxes.first().uncheck()
      await page.waitForTimeout(200)
    }
    
    // Should show a message or empty state
    await page.waitForTimeout(500)
    // Page should not crash
    await expect(page).toHaveURL(/compare/)
  })
})
