import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  // Navigate to the homepage
  await page.goto('/');

  // Check that the page loaded by looking for some common elements
  // You'll need to adjust these selectors based on your actual homepage
  await expect(page).toHaveTitle(/OZ Developer Dash/);

  // Example: Check for a heading or main content
  // await expect(page.locator('h1')).toContainText('Welcome');
});

test('admin login page is accessible', async ({ page }) => {
  // Navigate to admin login
  await page.goto('/admin/login');

  // Check that login form elements exist
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();

  // Example: Check for login button
  // await expect(page.locator('button[type="submit"]')).toContainText('Login');
});
