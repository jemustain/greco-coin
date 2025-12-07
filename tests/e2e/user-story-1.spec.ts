/**
 * E2E Tests for User Story 1: MVP - Interactive Charts
 * Tests the homepage with time series charts and controls
 */

import { test, expect } from '@playwright/test'

test.describe('User Story 1: MVP Interactive Charts', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/')
  })

  test('should load homepage with chart', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Greco Coin/)
    
    // Check main heading
    await expect(page.locator('h1')).toContainText('Greco Unit Historical Values')
    
    // Check that chart container is visible
    const chartContainer = page.locator('.chart-container')
    await expect(chartContainer).toBeVisible()
  })

  test('should have functional currency selector', async ({ page }) => {
    // Find currency selector
    const currencySelect = page.locator('select#currency-select')
    await expect(currencySelect).toBeVisible()
    
    // Check default selection (should be USD)
    await expect(currencySelect).toHaveValue('USD')
    
    // Change to EUR
    await currencySelect.selectOption('EUR')
    await page.waitForTimeout(1000) // Wait for chart to update
    
    // Verify EUR is selected
    await expect(currencySelect).toHaveValue('EUR')
  })

  test('should have functional time range selector', async ({ page }) => {
    // Find time range selector
    const timeRangeSelect = page.locator('select').filter({ hasText: /1 Year|5 Years|10 Years|All Time/ })
    await expect(timeRangeSelect).toBeVisible()
    
    // Try different time ranges
    await timeRangeSelect.selectOption({ label: '5 Years' })
    await page.waitForTimeout(1000)
    
    await timeRangeSelect.selectOption({ label: '10 Years' })
    await page.waitForTimeout(1000)
  })

  test('should display chart statistics', async ({ page }) => {
    // Check for statistics cards
    const statsSection = page.locator('text=Latest Value').or(page.locator('text=Highest')).or(page.locator('text=Lowest'))
    await expect(statsSection.first()).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      // Check that mobile layout is working
      const mobileNav = page.locator('nav')
      await expect(mobileNav).toBeVisible()
      
      // Chart should still be visible
      const chartContainer = page.locator('.chart-container')
      await expect(chartContainer).toBeVisible()
    }
  })

  test('should have accessible navigation', async ({ page }) => {
    // Check that navigation links exist and are accessible
    await expect(page.locator('nav a:has-text("Home")')).toBeVisible()
    await expect(page.locator('nav a:has-text("Compare")').or(page.locator('nav button:has-text("Compare")'))).toBeVisible()
    await expect(page.locator('nav a:has-text("Data")').or(page.locator('nav button:has-text("Data")'))).toBeVisible()
    await expect(page.locator('nav a:has-text("About")').or(page.locator('nav button:has-text("About")'))).toBeVisible()
  })

  test('should show data quality indicators', async ({ page }) => {
    // Look for quality indicators (completeness badges, etc.)
    const qualityIndicator = page.locator('text=/\\d+%/').or(page.locator('[class*="quality"]'))
    // At least one quality indicator should be present
    const count = await qualityIndicator.count()
    expect(count).toBeGreaterThan(0)
  })
})
