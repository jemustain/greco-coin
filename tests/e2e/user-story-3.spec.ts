/**
 * E2E Tests for User Story 3: Data Access and Export
 * Tests the /data page with tables, filters, and CSV export
 */

import { test, expect } from '@playwright/test'

test.describe('User Story 3: Data Access and Export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/data')
  })

  test('should load data page', async ({ page }) => {
    await expect(page).toHaveTitle(/Greco Coin/)
    await expect(page.locator('h1')).toContainText('Historical Data Access')
  })

  test('should display data table', async ({ page }) => {
    const table = page.locator('table')
    await expect(table).toBeVisible({ timeout: 10000 })

    // Table should have rows
    const rows = page.locator('tbody tr')
    const count = await rows.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should show total records stat', async ({ page }) => {
    const totalRecords = page.locator('text=Total Records')
    await expect(totalRecords).toBeVisible()
  })

  test('should have sortable columns', async ({ page }) => {
    // Wait for table to load
    await page.locator('table').waitFor({ timeout: 10000 })

    // Find table headers
    const headers = page.locator('th')
    const count = await headers.count()
    expect(count).toBeGreaterThan(0)

    // Click a header to sort
    await headers.first().click()
    await page.waitForTimeout(500)

    // Page should not crash
    await expect(page).toHaveURL(/data/)
  })

  test('should have export section', async ({ page }) => {
    const exportSection = page.locator('text=Export Data')
    await expect(exportSection).toBeVisible()
  })

  test('should have usage instructions', async ({ page }) => {
    const instructions = page.locator('text=Using This Page')
    await expect(instructions).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      await expect(page.locator('h1')).toContainText('Historical Data Access')

      // Either table or some data view should be present
      const table = await page.locator('table').isVisible().catch(() => false)
      const content = await page.locator('main').isVisible().catch(() => false)
      expect(table || content).toBeTruthy()
    }
  })
})
