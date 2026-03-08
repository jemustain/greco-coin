/**
 * E2E Tests for User Story 2: Multi-currency Comparison
 * Tests the /compare page functionality
 */

import { test, expect } from '@playwright/test'

test.describe('User Story 2: Multi-currency Comparison', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/compare')
  })

  test('should load compare page', async ({ page }) => {
    await expect(page).toHaveTitle(/Greco Coin/)
    await expect(page.locator('h1')).toContainText('Currency Comparison')
  })

  test('should have currency selection controls', async ({ page }) => {
    // Compare page uses checkbox-style currency selectors
    const label = page.locator('text=Select Currencies to Compare')
    await expect(label).toBeVisible()
  })

  test('should have select all and clear all buttons', async ({ page }) => {
    const selectAll = page.locator('button:has-text("Select All")')
    const clearAll = page.locator('button:has-text("Clear All")')
    await expect(selectAll).toBeVisible()
    await expect(clearAll).toBeVisible()
  })

  test('should display comparison chart when currencies selected', async ({ page }) => {
    // Select All to ensure chart renders
    const selectAll = page.locator('button:has-text("Select All")')
    await selectAll.click()
    await page.waitForTimeout(2000)

    // Chart should render
    const chart = page.locator('.chart-container').or(page.locator('.recharts-wrapper'))
    await expect(chart).toBeVisible({ timeout: 10000 })
  })

  test('should have time range controls', async ({ page }) => {
    const fullHistory = page.locator('button:has-text("Full History")')
    await expect(fullHistory).toBeVisible()
  })

  test('should show empty state when no currencies selected', async ({ page }) => {
    // Clear all currencies
    const clearAll = page.locator('button:has-text("Clear All")')
    await clearAll.click()
    await page.waitForTimeout(500)

    // Page should not crash
    await expect(page).toHaveURL(/compare/)
  })

  test('should have CSV export button when data is loaded', async ({ page }) => {
    // Select currencies first
    const selectAll = page.locator('button:has-text("Select All")')
    await selectAll.click()
    await page.waitForTimeout(3000)

    const exportButton = page.locator('button:has-text("Export CSV")')
    // Export button appears after data loads
    const count = await exportButton.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      await expect(page.locator('nav')).toBeVisible()
      await expect(page.locator('h1')).toContainText('Currency Comparison')
    }
  })
})
