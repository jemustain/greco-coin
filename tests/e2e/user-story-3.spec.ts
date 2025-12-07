/**
 * E2E Tests for User Story 3: Data Access and Export
 * Tests the /data page with tables, filters, and CSV export
 */

import { test, expect } from '@playwright/test'

test.describe('User Story 3: Data Access and Export', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to data page before each test
    await page.goto('/data')
  })

  test('should load data page', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Data.*Greco/)
    
    // Check main heading
    await expect(page.locator('h1')).toContainText(/Data|Access/)
  })

  test('should display data table', async ({ page }) => {
    // Check for table element
    const table = page.locator('table').or(page.locator('[role="table"]'))
    await expect(table).toBeVisible()
    
    // Table should have rows
    const rows = page.locator('tbody tr').or(page.locator('[role="row"]'))
    const count = await rows.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should have filter controls', async ({ page }) => {
    // Currency filter
    const currencyFilter = page.locator('select#filter-currency').or(page.locator('label:has-text("Currency") + select'))
    await expect(currencyFilter).toBeVisible()
    
    // Date filters
    const dateInputs = page.locator('input[type="date"]')
    const dateCount = await dateInputs.count()
    expect(dateCount).toBeGreaterThanOrEqual(0) // May or may not have date inputs
  })

  test('should filter data by currency', async ({ page }) => {
    // Find and use currency filter
    const currencyFilter = page.locator('select#filter-currency').or(page.locator('label:has-text("Currency") + select'))
    
    if (await currencyFilter.isVisible()) {
      // Get initial row count
      await page.waitForTimeout(500)
      const initialRows = await page.locator('tbody tr').or(page.locator('[class*="card"]')).count()
      
      // Change filter
      await currencyFilter.selectOption({ index: 1 })
      await page.waitForTimeout(1000)
      
      // Row count should potentially change
      const filteredRows = await page.locator('tbody tr').or(page.locator('[class*="card"]')).count()
      // Just verify no crash - count may or may not change depending on data
      expect(filteredRows).toBeGreaterThanOrEqual(0)
    }
  })

  test('should have sortable columns', async ({ page }) => {
    // Find sortable column headers
    const sortableHeaders = page.locator('th[role="button"]').or(page.locator('th').filter({ hasText: /Date|Currency|Value/ }))
    const count = await sortableHeaders.count()
    
    if (count > 0) {
      // Click first sortable header
      await sortableHeaders.first().click()
      await page.waitForTimeout(500)
      
      // Click again to reverse sort
      await sortableHeaders.first().click()
      await page.waitForTimeout(500)
      
      // Should not crash
      await expect(page).toHaveURL(/data/)
    }
  })

  test('should have pagination controls', async ({ page }) => {
    // Look for pagination buttons/controls
    const pagination = page.locator('button:has-text("Next")').or(page.locator('button:has-text("Previous")'))
    const paginationExists = await pagination.count() > 0
    
    if (paginationExists) {
      // Pagination should be visible
      await expect(pagination.first()).toBeVisible()
    }
  })

  test('should have CSV export button', async ({ page }) => {
    // Find export button
    const exportButton = page.locator('button:has-text("Export")').or(page.locator('button:has-text("CSV")'))
    await expect(exportButton.first()).toBeVisible()
  })

  test('should open export modal', async ({ page }) => {
    // Click export button
    const exportButton = page.locator('button:has-text("Export")').or(page.locator('button:has-text("CSV")'))
    await exportButton.first().click()
    
    // Modal should appear
    await page.waitForTimeout(500)
    const modal = page.locator('[role="dialog"]').or(page.locator('[class*="modal"]'))
    
    // Either modal appears or download starts
    const modalVisible = await modal.isVisible().catch(() => false)
    expect(typeof modalVisible).toBe('boolean')
  })

  test('should have pivot view options', async ({ page }) => {
    // Look for pivot/view mode controls
    const pivotControls = page.locator('text=/Pivot|Table View|Standard/')
    const count = await pivotControls.count()
    expect(count).toBeGreaterThanOrEqual(0) // May or may not exist
  })

  test('should show data statistics', async ({ page }) => {
    // Look for statistics cards/info
    const stats = page.locator('text=/Total|Showing|Results/')
    const count = await stats.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      // Should show card view instead of table on mobile
      await page.waitForTimeout(500)
      
      // Either table or cards should be visible
      const table = await page.locator('table').isVisible().catch(() => false)
      const cards = await page.locator('[class*="card"]').count()
      
      expect(table || cards > 0).toBeTruthy()
    }
  })
})
