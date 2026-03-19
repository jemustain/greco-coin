/**
 * E2E Tests for User Story 4: Educational Content
 * Tests the /about page with methodology, commodities, and sources (all on one page)
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

  test('should display the 33 commodities', async ({ page }) => {
    await page.goto('/about')

    // Should list "The 33 Commodities" section
    const commoditiesSection = page.locator('text=The 33 Commodities')
    await expect(commoditiesSection).toBeVisible()

    // Should reference specific commodities
    const commodityText = page.locator('text=/Gold|Silver|Iron|Copper|Wheat|Corn/i')
    await expect(commodityText.first()).toBeVisible()
  })

  test('should explain how it works (methodology)', async ({ page }) => {
    await page.goto('/about')

    const howItWorks = page.locator('text=How It Works')
    await expect(howItWorks).toBeVisible()

    // Should have numbered steps
    const steps = page.locator('text=/Collect prices|Normalize to USD|Compute basket|Normalize to baseline/i')
    await expect(steps.first()).toBeVisible()
  })

  test('should list data sources', async ({ page }) => {
    await page.goto('/about')

    // Should have Data Sources section
    const sourcesSection = page.locator('text=Data Sources')
    await expect(sourcesSection).toBeVisible()

    // Should reference known data sources
    const sourceText = page.locator('text=/USGS|FRED|EIA|FAOSTAT/i')
    await expect(sourceText.first()).toBeVisible()
  })

  test('should have link to explore data', async ({ page }) => {
    await page.goto('/about')

    const dataLink = page.locator('a[href="/data"]')
    await expect(dataLink.first()).toBeVisible()
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
