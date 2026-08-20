import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { Session } from "@contracts/constants";
import { signSessionToken } from "../server/auth/session";
import { createTestUser } from "../server/test-helpers";

const categories = [
  ["keyholes", "Keyholes", true],
  ["tfe", "Top-Front-End", true],
  ["angle_ranking", "Angle Ranking", false],
  ["hole_punching", "Hole Punching", true],
  ["cube_counting", "Cube Counting", false],
  ["pattern_folding", "Pattern Folding", true],
] as const;

async function dismissOnboarding(page: Page) {
  const onboarding = page.getByRole("dialog", {
    name: "Welcome to PreDent Canada",
  });
  if (await onboarding.isVisible()) {
    await onboarding.getByRole("button", { name: "Skip" }).click();
    await expect(onboarding).toBeHidden();
  }
}

async function setQuestionCount(page: Page, count: number) {
  const range = page.locator('input[type="range"]');
  await expect(range).toBeVisible();
  await range.evaluate((element, value) => {
    const input = element as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value"
    )?.set;
    setter?.call(input, String(value));
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, count);
}

async function assertMobileGeometry(page: Page) {
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth + 1
    )
  ).toBe(true);

  const promptSvgs = page.locator(".manipat-svg svg");
  expect(await promptSvgs.count()).toBeGreaterThan(0);
  const promptBox = await promptSvgs.first().boundingBox();
  expect(promptBox?.width ?? 0).toBeGreaterThan(20);
  expect(promptBox?.height ?? 0).toBeGreaterThan(20);

  const choices = page.locator('button[aria-pressed]');
  const choiceCount = await choices.count();
  expect(choiceCount).toBeGreaterThanOrEqual(4);
  expect(choiceCount).toBeLessThanOrEqual(5);
  for (let index = 0; index < choiceCount; index += 1) {
    const box = await choices.nth(index).boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(40);
    expect(box?.height ?? 0).toBeGreaterThan(40);
  }
}

async function captureCorpus(
  page: Page,
  testInfo: TestInfo,
  category: string
) {
  const path = testInfo.outputPath(`pat-${category}.png`);
  await page.screenshot({ path, fullPage: true });
  await testInfo.attach(`pat-${category}`, {
    path,
    contentType: "image/png",
  });
}

test.describe.configure({ mode: "serial" });
test.use({ viewport: { width: 390, height: 844 } });

test("compiled production server renders and scores a six-category ManipAT corpus", async ({
  page,
  context,
}, testInfo) => {
  test.skip(
    process.env.PAT_E2E_PRODUCTION !== "1",
    "Runs only in the compiled-production PAT release gate"
  );

  const user = await createTestUser({
    tier: "premium",
    premiumUntil: new Date("2099-01-01T00:00:00.000Z"),
  });
  const token = await signSessionToken({
    unionId: user.unionId,
    provider: user.provider,
    tokenVersion: user.tokenVersion,
  });

  await context.addCookies([
    {
      name: Session.productionCookieName,
      value: token,
      url: "https://localhost:3000",
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
    },
  ]);
  await page.addInitScript(() => {
    localStorage.setItem("predent_telemetry_consent", "denied");
  });

  for (const [category, displayName, choicesUseSvg] of categories) {
    await page.goto(`/pat-academy/practice?category=${category}`);
    await dismissOnboarding(page);
    await expect(page.getByRole("heading", { name: "PAT Practice" })).toBeVisible();
    await setQuestionCount(page, 5);
    const start = page.getByRole("button", {
      name: "Start 5-Question Session",
    });
    await expect(start).toBeEnabled();
    await start.click();

    await expect(page.getByText("1/5", { exact: true })).toBeVisible();
    await expect(page.getByText(displayName, { exact: true })).toBeVisible();
    await assertMobileGeometry(page);

    const choiceSvgCount = await page
      .locator('button[aria-pressed] .manipat-svg svg')
      .count();
    if (choicesUseSvg) expect(choiceSvgCount).toBeGreaterThan(0);
    else expect(choiceSvgCount).toBe(0);

    await captureCorpus(page, testInfo, category);

    for (let question = 0; question < 5; question += 1) {
      const choices = page.locator('button[aria-pressed]');
      await expect(choices.first()).toBeVisible();
      await choices.first().click();
      if (question < 4) {
        await page.getByRole("button", { name: "Next" }).click();
        await expect(
          page.getByText(`${question + 2}/5`, { exact: true })
        ).toBeVisible();
        await assertMobileGeometry(page);
      }
    }

    await page.getByRole("button", { name: "Submit" }).click();
    await expect(
      page.getByRole("heading", { name: "Session Results" })
    ).toBeVisible();
    await expect(page.getByText(/Correct answer:/).first()).toBeVisible();
    await expect(
      page.getByText(/Scored server-side with ManipAT engine/)
    ).toBeVisible();

    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth + 1
      )
    ).toBe(true);
  }
});