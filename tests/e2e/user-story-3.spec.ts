/**
 * E2E Tests for User Story 3: Data Access and Export
 * Tests the /data page with commodity tables, filters, and CSV export
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

  test('should display data table', async ({ page, isMobile }) => {
    if (isMobile) {
      // Wait for commodity data to load
      const priceHeading = page.getByRole('heading', { name: 'Commodity Price Data' })
      await expect(priceHeading).toBeVisible({ timeout: 30000 })
      // Mobile card view should be visible
      const mobileCards = page.locator('.md\\:hidden .divide-y, .md\\:hidden')
      const count = await mobileCards.count()
      expect(count).toBeGreaterThan(0)
    } else {
      // Desktop: commodity tables are visible
      const table = page.locator('table').first()
      await expect(table).toBeVisible({ timeout: 30000 })
      const rows = table.locator('tbody tr')
      await expect(rows.first()).toBeVisible({ timeout: 5000 })
      const count = await rows.count()
      expect(count).toBeGreaterThan(0)
    }
  })

  test('should show total records stat', async ({ page }) => {
    const totalRecords = page.locator('text=Total Records')
    await expect(totalRecords).toBeVisible()
  })

  test('should have sortable columns', async ({ page, isMobile }) => {
    if (isMobile) {
      // Tables aren't visible on mobile — skip column sorting test
      await expect(page.locator('h1')).toContainText('Historical Data Access')
      return
    }

    // Wait for data to load and table to appear
    await page.locator('table').first().waitFor({ timeout: 30000 })

    // Find table headers (first table)
    const headers = page.locator('table').first().locator('th')
    const count = await headers.count()
    expect(count).toBeGreaterThan(0)

    // Click a header to sort
    await headers.first().click()
    await page.waitForTimeout(500)

    // Page should not crash
    await expect(page).toHaveURL(/data/)
  })

  test('should have export section', async ({ page }) => {
    // Export CSV buttons render with commodity data
    const exportButton = page.locator('text=Export CSV').first()
    await expect(exportButton).toBeVisible({ timeout: 30000 })
  })

  test('should have usage instructions', async ({ page }) => {
    const instructions = page.locator('text=Using This Page')
    await expect(instructions).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      await expect(page.locator('h1')).toContainText('Historical Data Access')
    }
  })
})
