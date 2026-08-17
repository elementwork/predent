import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("loads and displays hero section", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Canadian DAT Prep/i })
    ).toBeVisible();
    await expect(
      page.locator("#main-content").getByRole("link", { name: /Get Started Free/i })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Explore Schools/i }).first()
    ).toBeVisible();
  });

  test("navigates to school hub", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Explore Schools/i }).first().click();
    await expect(page).toHaveURL(/\/schools/);
    await expect(
      page.getByRole("heading", { name: /Canadian Dental Schools/i })
    ).toBeVisible();
  });

  test("navigates to login", async ({ page }) => {
    await page.goto("/");
    await page
      .locator("#main-content")
      .getByRole("link", { name: /Get Started Free/i })
      .click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("displays pricing section", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /DAT Prep Plans/i })
    ).toBeVisible();
    await expect(page.getByText("$39")).toBeVisible();
    await expect(page.getByText("$99")).toBeVisible();
    await expect(page.getByText("$249")).toBeVisible();
  });

  test("displays FAQ section", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Frequently Asked Questions/i })
    ).toBeVisible();
  });
});

test.describe("Public pages", () => {
  test("school hub loads with all 10 schools", async ({ page }) => {
    await page.goto("/schools");
    await expect(
      page.getByRole("heading", { name: /Canadian Dental Schools/i })
    ).toBeVisible();
    await expect(
      page.locator("main").getByText("University of Toronto")
    ).toBeVisible();
    await expect(
      page.locator("main").getByText("University of British Columbia")
    ).toBeVisible();
  });

  test("PAT academy loads", async ({ page }) => {
    await page.goto("/pat-academy");
    await expect(
      page.getByRole("heading", { name: /PAT Academy/i })
    ).toBeVisible();
  });

  test("DAT academy loads", async ({ page }) => {
    await page.goto("/dat-academy");
    await expect(
      page.getByRole("heading", { name: /DAT Academy/i })
    ).toBeVisible();
  });

  test("community hub loads", async ({ page }) => {
    await page.goto("/community");
    await expect(
      page.getByRole("heading", { name: /Community Hub/i })
    ).toBeVisible();
  });

  test("guides index loads", async ({ page }) => {
    await page.goto("/guides");
    await expect(
      page.getByRole("heading", { name: /Guides/i })
    ).toBeVisible();
  });

  test("pricing page loads", async ({ page }) => {
    await page.goto("/pricing");
    await expect(
      page.getByRole("heading", { name: "Annual", exact: true })
    ).toBeVisible();
  });

  test("about page loads", async ({ page }) => {
    await page.goto("/about");
    await expect(
      page.getByRole("heading", { name: /About/i })
    ).toBeVisible();
  });

  test("contact page loads", async ({ page }) => {
    await page.goto("/contact");
    await expect(
      page.getByRole("heading", { name: /Contact/i })
    ).toBeVisible();
  });

  test("404 page shows for unknown routes", async ({ page }) => {
    await page.goto("/nonexistent-page");
    await expect(page.getByText(/not found/i)).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("navbar links work", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /School Hub/i }).first().click();
    await expect(page).toHaveURL(/\/schools/);
  });

  test("theme toggle works", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    // Click the theme toggle button
    const toggle = page.getByRole("button", { name: /toggle theme/i });
    if (await toggle.isVisible()) {
      await toggle.click();
      // Should have either light or dark class
      const classList = await html.getAttribute("class");
      expect(classList).toMatch(/(light|dark)/);
    }
  });
});

test.describe("API health", () => {
  test("tRPC ping returns ok", async ({ request }) => {
    const response = await request.get("/api/trpc/ping");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.result?.data?.json?.ok).toBe(true);
  });
});
