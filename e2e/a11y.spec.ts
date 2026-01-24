import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility Checks', () => {
    test('Landing page should have no detectable a11y violations', async ({ page }) => {
        await page.goto('/tr');
        await injectAxe(page);
        await checkA11y(page, undefined, {
            detailedReport: true,
            detailedReportOptions: { html: true },
        });
    });

    test('Login page should have no detectable a11y violations', async ({ page }) => {
        await page.goto('/tr/login');
        await injectAxe(page);
        await checkA11y(page);
    });
});
