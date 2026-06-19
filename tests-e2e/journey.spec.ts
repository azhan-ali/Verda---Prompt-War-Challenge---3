import { test, expect } from "@playwright/test";

test.describe("Verda E2E User Journey", () => {
  test("should authenticate, select city, log activity, and render dashboard modules", async ({ page }) => {
    // 1. Navigate to Sign In page with callbackUrl to dashboard
    await page.goto("/api/auth/signin?callbackUrl=/dashboard");
    
    // 2. Fill credentials email and sign in
    await page.fill('input[name="email"]', `e2e-${Date.now()}@example.com`);
    await page.click('button:has-text("Sign in with Mock Credentials (Testing)")');

    // 3. Should redirect to dashboard and show city selection modal
    await expect(page).toHaveURL(/\/dashboard/);
    
    // 4. Onboarding modal: click Patna as primary city
    await page.click('button:has-text("Patna")');
    await expect(page.locator('text=Select your city')).toBeHidden();

    // 5. Confirm dashboard elements appear
    await expect(page.locator('h1')).toContainText("Welcome back");
    await expect(page.locator('h2:has-text("Profile & Location")')).toBeVisible();
    await expect(page.locator('h2:has-text("Baseline Benchmark")')).toBeVisible();
    await expect(page.locator('h2:has-text("Green Streak")')).toBeVisible();
    await expect(page.locator('h2:has-text("Your Carbon Twin")')).toBeVisible();
    await expect(page.locator('h2:has-text("Daily Receipt")')).toBeVisible();

    // 6. Enter activity in MagicInput
    const textarea = page.locator('textarea[placeholder="Tell me what you did today..."]');
    await expect(textarea).toBeVisible();
    await textarea.fill("drove 20km petrol car");
    await page.click('button[type="submit"]');

    // 7. Verify Carbon Receipt has items logged (shows up after reload finishes)
    const receiptContainer = page.locator('h2:has-text("Daily Receipt")').locator('..');
    await expect(receiptContainer).toContainText("drove 20km petrol car", { timeout: 15000 });
    await expect(receiptContainer).toContainText("3.40 kg"); // 20km * 0.17 = 3.4kg CO2

    // 10. Check Carbon Twin state updates
    const twinContainer = page.locator('text=Your Carbon Twin').locator('..');
    await expect(twinContainer).toBeVisible();
    
    // 11. Check Green Streak grid is visible
    const streakContainer = page.locator('text=Green Streak').locator('..');
    await expect(streakContainer).toBeVisible();
  });
});
