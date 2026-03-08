/**
 * E2E Tests for User Story 4: Educational Content
 * Tests the /about pages with methodology and sources
 */

import { test, expect } from '@playwright/test'

test.describe('User Story 4: Educational Content', () => {
  test('should load about page', async ({ page }) => {
    await page.goto('/about')

    await expect(page).toHaveTitle(/Greco Coin/)
    await expect(page.locator('h1')).toContainText('About the Greco Unit')

    // Should mention the Greco concept
    const content = page.locator('text=/Greco|commodity|purchasing power/i')
    await expect(content.first()).toBeVisible()
  })

  test('should explain what a Greco is', async ({ page }) => {
    await page.goto('/about')

    const whatIsGreco = page.locator('text=What is a Greco?')
    await expect(whatIsGreco).toBeVisible()
  })

  test('should navigate to methodology page', async ({ page }) => {
    await page.goto('/about')

    const methodologyLink = page.locator('a[href*="methodology"]')
    await expect(methodologyLink.first()).toBeVisible()
    await methodologyLink.first().click()

    await expect(page).toHaveURL(/methodology/)
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should display commodities on methodology page', async ({ page }) => {
    await page.goto('/about/methodology')

    // Should reference commodities
    const commodityText = page.locator('text=/Gold|Silver|Iron|Copper|Wheat|Corn/i')
    await expect(commodityText.first()).toBeVisible()

    // Should have tables listing commodities
    const tables = page.locator('table')
    const tableCount = await tables.count()
    expect(tableCount).toBeGreaterThan(0)
  })

  test('should navigate to sources page', async ({ page }) => {
    await page.goto('/about')

    const sourcesLink = page.locator('a[href*="sources"]')
    if (await sourcesLink.count() > 0) {
      await sourcesLink.first().click()
      await expect(page).toHaveURL(/sources/)
      await expect(page.locator('h1')).toBeVisible()
    }
  })

  test('should list data sources on sources page', async ({ page }) => {
    await page.goto('/about/sources')

    // Should reference known data sources
    const sourceText = page.locator('text=/USGS|World Bank|FRED/i')
    await expect(sourceText.first()).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      await page.goto('/about')
      await expect(page.locator('h1')).toContainText('About the Greco Unit')
      await expect(page.locator('nav')).toBeVisible()
    }
  })

  test('should have accessible content structure', async ({ page }) => {
    await page.goto('/about')

    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()

    const paragraphs = page.locator('p')
    const pCount = await paragraphs.count()
    expect(pCount).toBeGreaterThan(0)
  })
})
