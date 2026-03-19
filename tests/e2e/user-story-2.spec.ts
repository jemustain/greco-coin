/**
 * E2E Tests for User Story 2: Commodity Explorer
 * Tests the /compare page with commodity selection, charts, and production data
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
    await expect(label.first()).toBeVisible({ timeout: 15000 })
  })

  test('should have baseline year selector', async ({ page }) => {
    const baselineSelect = page.locator('select#baseline-year')
    await expect(baselineSelect).toBeVisible({ timeout: 15000 })
  })

  test('should display chart when commodities are selected', async ({ page }) => {
    // Default commodities are pre-selected
    // Wait for chart to render
    const chart = page.locator('.chart-container').or(page.locator('.recharts-wrapper'))
    await expect(chart.first()).toBeVisible({ timeout: 15000 })
  })

  test('should show world production volume section', async ({ page }) => {
    const productionHeading = page.locator('text=World Production Volume')
    await expect(productionHeading).toBeVisible({ timeout: 15000 })
  })

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      // Nav is behind hamburger on mobile
      const hamburger = page.locator('button[aria-label="Toggle navigation menu"]')
      await expect(hamburger).toBeVisible()
      await expect(page.locator('h1')).toContainText('Commodity Explorer')
    }
  })
})
