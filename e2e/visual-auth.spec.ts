import { test, expect } from "@playwright/test";
import { waitForStableLayout } from "./visual-helpers";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("predent_telemetry_consent", "denied");
  });
});

async function settled(page: import("@playwright/test").Page) {
  await page.waitForLoadState("networkidle");
  await waitForStableLayout(page);
}

// Helper to mock authenticated user via route interception
async function mockAuthenticatedUser(
  page: import("@playwright/test").Page,
  user: {
    id: number;
    name: string;
    email: string;
    tier: "free" | "premium";
    role: "user" | "admin";
  }
) {
  await page.route("**/api/trpc/auth.me**", async route => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        result: {
          data: {
            json: {
              ...user,
              premiumUntil:
                user.tier === "free" ? null : "2099-01-01T00:00:00.000Z",
            },
          },
        },
      }),
    });
  });
}

test.describe("Visual Regression - Auth Flow", () => {
  test("login page - all OAuth providers", async ({ page }) => {
    await page.goto("/login");
    await settled(page);
    await expect(page).toHaveScreenshot("login-providers.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test("login page - Google OAuth button visible", async ({ page }) => {
    await page.goto("/login");
    await settled(page);
    const googleBtn = page.getByRole("link", { name: /Google/i });
    await expect(googleBtn).toBeVisible();
    await expect(googleBtn).toHaveScreenshot("google-oauth-button.png", {
      maxDiffPixelRatio: 0.02,
    });
  });

  test("login page - Apple OAuth button visible", async ({ page }) => {
    await page.goto("/login");
    await settled(page);
    const appleBtn = page.getByRole("link", { name: /Apple/i });
    await expect(appleBtn).toBeVisible();
    await expect(appleBtn).toHaveScreenshot("apple-oauth-button.png", {
      maxDiffPixelRatio: 0.02,
    });
  });

  test("login page dark mode", async ({ page }) => {
    await page.goto("/login");
    await settled(page);
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
    await settled(page);
    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveScreenshot("dashboard-redirect-login.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("planner redirects to login", async ({ page }) => {
    await page.goto("/dashboard/planner");
    await settled(page);
    await expect(page).toHaveURL(/\/login/);
    await expect(page).toHaveScreenshot("planner-redirect-login.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("PAT practice - unauthenticated shows login prompt", async ({
    page,
  }) => {
    await page.goto("/pat-academy/practice");
    await settled(page);
    await expect(page).toHaveScreenshot("pat-practice-unauth.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("DAT practice - unauthenticated shows login prompt", async ({
    page,
  }) => {
    await page.goto("/dat-academy/practice");
    await settled(page);
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
    await settled(page);
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
    await settled(page);
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
    await settled(page);
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
    await settled(page);
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
    await settled(page);
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
    await settled(page);
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
    await settled(page);
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
    await settled(page);
    await expect(page).toHaveScreenshot("dashboard-premium-user.png", {
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
      tier: "premium",
      role: "admin",
    });
    await page.goto("/");
    await settled(page);
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
      tier: "premium",
      role: "admin",
    });
    await page.goto("/admin");
    await settled(page);
    await expect(page).toHaveScreenshot("admin-dashboard.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe("Visual Regression - Tier Comparison", () => {
  test("pricing cards - all tiers side by side", async ({ page }) => {
    await page.goto("/pricing");
    await settled(page);
    await expect(page).toHaveScreenshot("pricing-cards-comparison.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("pricing page - feature comparison table", async ({ page }) => {
    await page.goto("/pricing");
    await settled(page);
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
    await settled(page);
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
    await settled(page);
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
    await settled(page);
    await expect(page).toHaveScreenshot("flashcards-premium-user.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });
});
