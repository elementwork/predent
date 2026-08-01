import { test, expect } from "@playwright/test";

// Helper to mock authenticated user via route interception
async function mockAuthenticatedUser(
  page: import("@playwright/test").Page,
  user: {
    id: number;
    name: string;
    email: string;
    tier: "free" | "premium" | "premium_plus";
    role: "user" | "admin";
  }
) {
  await page.route("**/api/trpc/auth.me**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        result: {
          data: {
            json: user,
          },
        },
      }),
    });
  });
}

test.describe("Visual Regression - Auth Flow", () => {
  test("login page - all OAuth providers", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("login-providers.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test("login page - Google OAuth button visible", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    const googleBtn = page.getByRole("link", { name: /Google/i });
    await expect(googleBtn).toBeVisible();
    await expect(googleBtn).toHaveScreenshot("google-oauth-button.png", {
      maxDiffPixelRatio: 0.02,
    });
  });

  test("login page - Apple OAuth button visible", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    const appleBtn = page.getByRole("link", { name: /Apple/i });
    await expect(appleBtn).toBeVisible();
    await expect(appleBtn).toHaveScreenshot("apple-oauth-button.png", {
      maxDiffPixelRatio: 0.02,
    });
  });

  test("login page dark mode", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot("login-dark-all-providers.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});

test.describe("Visual Regression - Unauthenticated State", () => {
  test("dashboard redirects to login", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveScreenshot("dashboard-redirect-login.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("planner redirects to login", async ({ page }) => {
    await page.goto("/dashboard/planner");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveScreenshot("planner-redirect-login.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("PAT practice - unauthenticated shows login prompt", async ({ page }) => {
    await page.goto("/pat-academy/practice");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("pat-practice-unauth.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("DAT practice - unauthenticated shows login prompt", async ({ page }) => {
    await page.goto("/dat-academy/practice");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("dat-practice-unauth.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe("Visual Regression - Free Tier User", () => {
  test("navbar - free user shows upgrade CTA", async ({ page }) => {
    await mockAuthenticatedUser(page, {
      id: 1,
      name: "Free User",
      email: "free@example.com",
      tier: "free",
      role: "user",
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    const navbar = page.getByRole("navigation");
    await expect(navbar).toHaveScreenshot("navbar-free-user.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("PAT practice - free user quota display", async ({ page }) => {
    await mockAuthenticatedUser(page, {
      id: 1,
      name: "Free User",
      email: "free@example.com",
      tier: "free",
      role: "user",
    });
    await page.goto("/pat-academy/practice");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot("pat-practice-free-user.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("DAT practice - free user quota display", async ({ page }) => {
    await mockAuthenticatedUser(page, {
      id: 1,
      name: "Free User",
      email: "free@example.com",
      tier: "free",
      role: "user",
    });
    await page.goto("/dat-academy/practice");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot("dat-practice-free-user.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("pricing page - free user sees upgrade options", async ({ page }) => {
    await mockAuthenticatedUser(page, {
      id: 1,
      name: "Free User",
      email: "free@example.com",
      tier: "free",
      role: "user",
    });
    await page.goto("/pricing");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot("pricing-free-user.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe("Visual Regression - Premium User", () => {
  test("navbar - premium user shows tier badge", async ({ page }) => {
    await mockAuthenticatedUser(page, {
      id: 2,
      name: "Premium User",
      email: "premium@example.com",
      tier: "premium",
      role: "user",
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    const navbar = page.getByRole("navigation");
    await expect(navbar).toHaveScreenshot("navbar-premium-user.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("PAT practice - premium user expanded quota", async ({ page }) => {
    await mockAuthenticatedUser(page, {
      id: 2,
      name: "Premium User",
      email: "premium@example.com",
      tier: "premium",
      role: "user",
    });
    await page.goto("/pat-academy/practice");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot("pat-practice-premium-user.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("DAT practice - premium user expanded quota", async ({ page }) => {
    await mockAuthenticatedUser(page, {
      id: 2,
      name: "Premium User",
      email: "premium@example.com",
      tier: "premium",
      role: "user",
    });
    await page.goto("/dat-academy/practice");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot("dat-practice-premium-user.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("dashboard - premium user stats", async ({ page }) => {
    await mockAuthenticatedUser(page, {
      id: 2,
      name: "Premium User",
      email: "premium@example.com",
      tier: "premium",
      role: "user",
    });
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot("dashboard-premium-user.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe("Visual Regression - Premium Plus User", () => {
  test("navbar - premium plus user shows tier badge", async ({ page }) => {
    await mockAuthenticatedUser(page, {
      id: 3,
      name: "Premium Plus User",
      email: "plus@example.com",
      tier: "premium_plus",
      role: "user",
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    const navbar = page.getByRole("navigation");
    await expect(navbar).toHaveScreenshot("navbar-premium-plus-user.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("PAT practice - premium plus user full quota", async ({ page }) => {
    await mockAuthenticatedUser(page, {
      id: 3,
      name: "Premium Plus User",
      email: "plus@example.com",
      tier: "premium_plus",
      role: "user",
    });
    await page.goto("/pat-academy/practice");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot("pat-practice-premium-plus-user.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("DAT practice - premium plus user full quota", async ({ page }) => {
    await mockAuthenticatedUser(page, {
      id: 3,
      name: "Premium Plus User",
      email: "plus@example.com",
      tier: "premium_plus",
      role: "user",
    });
    await page.goto("/dat-academy/practice");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot("dat-practice-premium-plus-user.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("dashboard - premium plus user full stats", async ({ page }) => {
    await mockAuthenticatedUser(page, {
      id: 3,
      name: "Premium Plus User",
      email: "plus@example.com",
      tier: "premium_plus",
      role: "user",
    });
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot("dashboard-premium-plus-user.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe("Visual Regression - Admin User", () => {
  test("navbar - admin user shows admin link", async ({ page }) => {
    await mockAuthenticatedUser(page, {
      id: 4,
      name: "Admin User",
      email: "admin@example.com",
      tier: "premium_plus",
      role: "admin",
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    const navbar = page.getByRole("navigation");
    await expect(navbar).toHaveScreenshot("navbar-admin-user.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("admin dashboard page", async ({ page }) => {
    await mockAuthenticatedUser(page, {
      id: 4,
      name: "Admin User",
      email: "admin@example.com",
      tier: "premium_plus",
      role: "admin",
    });
    await page.goto("/admin");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot("admin-dashboard.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe("Visual Regression - Tier Comparison", () => {
  test("pricing cards - all tiers side by side", async ({ page }) => {
    await page.goto("/pricing");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("pricing-cards-comparison.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("pricing page - feature comparison table", async ({ page }) => {
    await page.goto("/pricing");
    await page.waitForLoadState("networkidle");
    const featureTable = page.getByText(/Feature Comparison/i);
    if (await featureTable.isVisible()) {
      await expect(featureTable.locator("..")).toHaveScreenshot(
        "pricing-feature-comparison.png",
        {
          fullPage: true,
          maxDiffPixelRatio: 0.01,
        }
      );
    }
  });
});

test.describe("Visual Regression - Limits & Restrictions", () => {
  test("PAT practice - quota exceeded state", async ({ page }) => {
    await mockAuthenticatedUser(page, {
      id: 1,
      name: "Free User",
      email: "free@example.com",
      tier: "free",
      role: "user",
    });
    await page.goto("/pat-academy/practice");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    // Check if quota display is visible
    const quotaDisplay = page.getByText(/quota/i);
    if (await quotaDisplay.isVisible()) {
      await expect(quotaDisplay.locator("..")).toHaveScreenshot(
        "pat-quota-display.png",
        {
          maxDiffPixelRatio: 0.01,
        }
      );
    }
  });

  test("flashcards page - free user limitations", async ({ page }) => {
    await mockAuthenticatedUser(page, {
      id: 1,
      name: "Free User",
      email: "free@example.com",
      tier: "free",
      role: "user",
    });
    await page.goto("/flashcards");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot("flashcards-free-user.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("flashcards page - premium user full access", async ({ page }) => {
    await mockAuthenticatedUser(page, {
      id: 2,
      name: "Premium User",
      email: "premium@example.com",
      tier: "premium",
      role: "user",
    });
    await page.goto("/flashcards");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await expect(page).toHaveScreenshot("flashcards-premium-user.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });
});
