import { test, expect } from '@playwright/test';

test.describe('Critical Flows Smoke Test', () => {

    test('Landing page should load successfully', async ({ page }) => {
        await page.goto('/');

        // Assert title
        await expect(page).toHaveTitle(/ProSektorWeb/);

        // Check for hero element
        const heroButton = page.getByRole('link', { name: /önizleme/i });
        await expect(heroButton).toBeVisible();
    });

    test('Login page should be accessible', async ({ page }) => {
        await page.goto('/login');

        // Check for email input
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    // We can't really test full login flow without mocking or seeding a test user
    // This is just a starting point.
});
