/**
 * E2E Tests for User Story 2: Commodity Explorer
 * Tests the /compare page functionality (Commodity Explorer)
 */

import { test, expect } from '@playwright/test'

test.describe('User Story 2: Commodity Explorer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/compare')
  })

  test('should load compare page', async ({ page }) => {
    await expect(page).toHaveTitle(/Greco Coin/)
    await expect(page.locator('h1')).toContainText('Commodity Explorer')
  })

  test('should have commodity selection controls', async ({ page }) => {
    // Compare page uses CommoditySelector with "Commodity Price Trends" heading
    const label = page.locator('text=Commodity Price Trends')
    await expect(label).toBeVisible({ timeout: 15000 })
  })

  test('should have baseline year selector', async ({ page }) => {
    const baselineSelect = page.locator('select#baseline-year')
    await expect(baselineSelect).toBeVisible({ timeout: 15000 })
  })

  test('should display chart when commodities are selected', async ({ page }) => {
    // Default commodities are pre-selected (gold, silver, petroleum, wheat, copper)
    // Wait for chart to render
    const chart = page.locator('.chart-container').or(page.locator('.recharts-wrapper'))
    await expect(chart.first()).toBeVisible({ timeout: 15000 })
  })

  test('should have time range controls', async ({ page }) => {
    const fullHistory = page.locator('button:has-text("Full History")')
    await expect(fullHistory).toBeVisible()
  })

  test('should have date range inputs', async ({ page }) => {
    const startDate = page.locator('input#start-date')
    const endDate = page.locator('input#end-date')
    await expect(startDate).toBeVisible()
    await expect(endDate).toBeVisible()
  })

  test('should show world production volume section', async ({ page }) => {
    const productionHeading = page.locator('text=World Production Volume')
    await expect(productionHeading).toBeVisible({ timeout: 15000 })
  })

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      await expect(page.locator('nav')).toBeVisible()
      await expect(page.locator('h1')).toContainText('Commodity Explorer')
    }
  })
})
