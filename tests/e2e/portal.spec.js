const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

test('dashboard search finds core study pages', async ({ page }) => {
  await page.goto('/index.html');
  await page.fill('#portalSearchInput', 'triangles');
  await expect(page.locator('#portalSearchResults')).toContainText('Triangles');
});

test('tracker saves a study log entry and shows focus timer controls', async ({ page }) => {
  await page.goto('/tracker.html');
  await page.fill('#logHours', '2');
  await page.fill('#logNotes', 'Solved examples');
  await page.click('button:has-text("Save Entry")');

  await expect(page.locator('#logBody')).toContainText('Maths');
  await expect(page.locator('#focusTimerCount')).toHaveText('25:00');
  await expect(page.locator('#focusSessionBody')).toContainText('No focus sessions saved yet.');
});

test('parent page stays locked until the configured PIN is entered', async ({ page }) => {
  await page.goto('/parent.html');
  await expect(page.locator('#parentLockCard')).toBeVisible();
  await expect(page.locator('#parentProtectedContent')).toBeHidden();

  await page.fill('#parentPinInput', '888888');
  await page.click('#parentUnlockBtn');

  await expect(page.locator('#parentProtectedContent')).toBeVisible();
  await expect(page.locator('#goalAlertBoard')).toBeVisible();
});
