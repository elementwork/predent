import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

function fixture(procedure: string) {
  if (procedure === "auth.me") {
    return {
      id: 1,
      name: "Accessible Admin",
      email: "admin@example.test",
      role: "admin",
      tier: "premium",
      premiumUntil: "2099-01-01T00:00:00.000Z",
    };
  }
  if (
    procedure.endsWith("listPage") ||
    procedure.endsWith("listUsersPage") ||
    procedure.endsWith("listQuestionsPage") ||
    procedure.endsWith("listReportsPage")
  ) {
    return { items: [], nextCursor: null };
  }
  if (procedure === "admin.stats") {
    return {
      users: 0,
      patQuestions: 0,
      patAttempts: 0,
      datQuestions: 0,
      datAttempts: 0,
    };
  }
  if (procedure === "task.stats") {
    return { total: 0, completed: 0, overdue: 0, upcoming: 0 };
  }
  if (procedure.includes("Count")) return 0;
  if (procedure === "notification.getPreferences") {
    return {
      emailTaskDue: true,
      emailStudyReminder: true,
      emailCommunity: true,
    };
  }
  if (procedure === "profile.get") return null;
  if (procedure.includes("recommend")) return [];
  return null;
}

async function mockApi(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("predent_telemetry_consent", "denied");
  });
  await page.route("**/api/trpc/**", async route => {
    const procedures = new URL(route.request().url()).pathname
      .split("/api/trpc/")[1]
      .split(",");
    const results = procedures.map(procedure => ({
      result: { data: { json: fixture(procedure) } },
    }));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(results.length === 1 ? results[0] : results),
    });
  });
}

for (const path of [
  "/dashboard",
  "/dashboard/planner",
  "/dashboard/settings/notifications",
  "/community",
  "/admin",
  "/admin/community",
]) {
  test(`${path} authenticated flow has no serious accessibility violations`, async ({
    page,
  }) => {
    await mockApi(page);
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter(violation =>
        ["serious", "critical"].includes(violation.impact ?? "")
      )
    ).toEqual([]);
  });
}

test("authenticated dashboard remains usable at 200 percent zoom", async ({
  page,
}) => {
  await mockApi(page);
  await page.goto("/dashboard");
  await page.evaluate(() => {
    document.documentElement.style.zoom = "2";
  });
  const onboarding = page.getByRole("dialog", {
    name: "Welcome to PreDent Canada",
  });
  await expect(onboarding).toBeVisible();
  await expect(onboarding.getByRole("button", { name: "Skip" })).toBeVisible();
  await onboarding.getByRole("button", { name: "Skip" }).click();
  await expect(onboarding).toBeHidden();
  await expect(page.locator("#main-content")).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth
    )
  ).toBe(true);
});
