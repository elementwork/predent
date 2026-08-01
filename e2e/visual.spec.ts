import { test, expect } from "@playwright/test";

test.describe("Visual Regression - Landing Page", () => {
  test("landing page full screenshot", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("landing-page.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("landing page hero section", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const hero = page.getByRole("heading", { name: /Canadian DAT Prep/i });
    await expect(hero).toBeVisible();
    await expect(hero).toHaveScreenshot("hero-section.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("landing page pricing section", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const pricing = page.getByRole("heading", { name: /DAT Prep Plans/i });
    await expect(pricing).toBeVisible();
    await expect(pricing.locator("..")).toHaveScreenshot("pricing-section.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe("Visual Regression - Public Pages", () => {
  test("schools hub page", async ({ page }) => {
    await page.goto("/schools");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("schools-hub.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("login page", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("login-page.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("pricing page", async ({ page }) => {
    await page.goto("/pricing");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("pricing-page.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("about page", async ({ page }) => {
    await page.goto("/about");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("about-page.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("contact page", async ({ page }) => {
    await page.goto("/contact");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("contact-page.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("guides index page", async ({ page }) => {
    await page.goto("/guides");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("guides-index.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("DAT academy page", async ({ page }) => {
    await page.goto("/dat-academy");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("dat-academy.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("PAT academy page", async ({ page }) => {
    await page.goto("/pat-academy");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("pat-academy.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("community hub page", async ({ page }) => {
    await page.goto("/community");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("community-hub.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("404 page", async ({ page }) => {
    await page.goto("/nonexistent-page");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("404-page.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe("Visual Regression - Dark Mode", () => {
  test("landing page dark mode", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot("landing-page-dark.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("schools hub dark mode", async ({ page }) => {
    await page.goto("/schools");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot("schools-hub-dark.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("login page dark mode", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => {
      document.documentElement.classList.add("dark");
    });
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot("login-page-dark.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe("Visual Regression - Navigation", () => {
  test("navbar desktop", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const navbar = page.getByRole("navigation");
    await expect(navbar).toBeVisible();
    await expect(navbar).toHaveScreenshot("navbar-desktop.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("navbar mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const navbar = page.getByRole("navigation");
    await expect(navbar).toBeVisible();
    await expect(navbar).toHaveScreenshot("navbar-mobile.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe("Visual Regression - Responsive", () => {
  test("landing page mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("landing-page-mobile.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("schools hub mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/schools");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("schools-hub-mobile.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("login page mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("login-page-mobile.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });
});
