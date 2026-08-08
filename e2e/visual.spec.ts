import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("predent_telemetry_consent", "denied");
  });
});

async function mockCommunityFeed(page: import("@playwright/test").Page) {
  const createdAt = new Date().toISOString();
  const posts = [
    {
      id: 101,
      userId: 11,
      type: "result",
      title: "Accepted to U of T Dentistry",
      content: "Sharing my application result with the community.",
      school: "University of Toronto",
      program: "DDS",
      result: "Accepted",
      gpa: "3.92",
      datAa: "23",
      datPat: "22",
      province: "IP",
      likes: 12,
      likedByViewer: false,
      createdAt,
      authorName: "Alex Chen",
      authorAvatar: null,
    },
    {
      id: 102,
      userId: 12,
      type: "question",
      title: "How did you prepare for PAT?",
      content: "Looking for study strategies for angle ranking.",
      school: null,
      program: null,
      result: null,
      gpa: null,
      datAa: null,
      datPat: null,
      province: null,
      likes: 7,
      likedByViewer: false,
      createdAt,
      authorName: "Jordan Patel",
      authorAvatar: null,
    },
    {
      id: 103,
      userId: 13,
      type: "discussion",
      title: "Fall application accountability group",
      content: "Join us for weekly application-planning check-ins.",
      school: null,
      program: null,
      result: null,
      gpa: null,
      datAa: null,
      datPat: null,
      province: null,
      likes: 4,
      likedByViewer: false,
      createdAt,
      authorName: "Sam Nguyen",
      authorAvatar: null,
    },
  ];

  await page.route("**/api/trpc/**", async route => {
    const marker = "/api/trpc/";
    const pathname = new URL(route.request().url()).pathname;
    const procedures = decodeURIComponent(
      pathname.slice(pathname.indexOf(marker) + marker.length)
    ).split(",");

    if (!procedures.some(procedure => procedure.startsWith("community."))) {
      await route.continue();
      return;
    }

    const responses = procedures.map(procedure => {
      const json =
        procedure === "community.listPostsPage"
          ? { items: posts, nextCursor: null }
          : procedure === "community.getPostCount"
            ? posts.length
            : null;
      return { result: { data: { json } } };
    });

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(responses.length === 1 ? responses[0] : responses),
    });
  });
}

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
    await expect(pricing.locator("..")).toHaveScreenshot(
      "pricing-section.png",
      {
        maxDiffPixelRatio: 0.01,
      }
    );
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
    await mockCommunityFeed(page);
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
    await expect(
      page.getByRole("heading", { name: /Canadian DAT Prep/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Frequently Asked Questions" })
    ).toBeVisible();
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
