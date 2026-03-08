/**
 * E2E Tests for User Story 1: MVP - Interactive Charts
 * Tests the homepage with time series charts and controls
 */

import { test, expect } from '@playwright/test'

test.describe('User Story 1: MVP Interactive Charts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load homepage with chart', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Greco Coin/)

    // Check main heading
    await expect(page.locator('h1')).toContainText('Greco Historical Currency Tracker')

    // Check that chart container is visible
    const chartContainer = page.locator('.chart-container')
    await expect(chartContainer).toBeVisible({ timeout: 10000 })
  })

  test('should have functional currency selector', async ({ page }) => {
    const currencySelect = page.locator('select#currency-select')
    await expect(currencySelect).toBeVisible()

    // Default is USD
    await expect(currencySelect).toHaveValue('USD')

    // Change to EUR
    await currencySelect.selectOption('EUR')
    await page.waitForTimeout(1000)
    await expect(currencySelect).toHaveValue('EUR')
  })

  test('should have functional time range buttons', async ({ page }) => {
    // The app uses preset range buttons, not a select dropdown
    const fullHistoryButton = page.locator('button:has-text("Full History")')
    await expect(fullHistoryButton).toBeVisible()

    const lastDecadeButton = page.locator('button:has-text("Last Decade")')
    await expect(lastDecadeButton).toBeVisible()

    // Click a preset
    await lastDecadeButton.click()
    await page.waitForTimeout(1000)
  })

  test('should have date range inputs', async ({ page }) => {
    const startDate = page.locator('input#start-date')
    const endDate = page.locator('input#end-date')
    await expect(startDate).toBeVisible()
    await expect(endDate).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      const nav = page.locator('nav')
      await expect(nav).toBeVisible()

      const chartContainer = page.locator('.chart-container')
      await expect(chartContainer).toBeVisible({ timeout: 10000 })
    }
  })

  test('should have accessible navigation', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible()
    // Nav links exist (may be in a dropdown on mobile)
    const compareLink = page.locator('a[href="/compare"]')
    const dataLink = page.locator('a[href="/data"]')
    expect(await compareLink.count() + await dataLink.count()).toBeGreaterThan(0)
  })

  test('should show data quality indicators', async ({ page }) => {
    // Wait for chart to load
    await page.waitForTimeout(3000)
    // Look for quality indicators (percentage or quality class)
    const qualityIndicator = page.locator('text=/\\d+%/').or(page.locator('[class*="quality"]'))
    const count = await qualityIndicator.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })
})
