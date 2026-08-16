import type { Page } from "@playwright/test";

/**
 * Waits until the document layout has stopped growing before a screenshot is
 * taken. Under a parallel test run the Vite dev server compiles routes on
 * first request, so `waitForLoadState("networkidle")` can resolve while the
 * page is still rendering, which produces mid-load screenshot captures that
 * are shorter than the settled layout.
 *
 * Polls the full-page scroll height until it is unchanged across several
 * reads, then gives entrance animations a beat to finish before returning.
 */
export async function waitForStableLayout(
  page: Page,
  timeoutMs = 20_000,
): Promise<void> {
  const started = Date.now();
  let previous = -1;
  let stableReads = 0;
  while (Date.now() - started < timeoutMs) {
    const height = await page.evaluate(
      () => document.documentElement.scrollHeight,
    );
    if (height === previous) {
      stableReads += 1;
      if (stableReads >= 3) {
        await page.waitForTimeout(300);
        return;
      }
    } else {
      stableReads = 0;
      previous = height;
    }
    await page.waitForTimeout(200);
  }
}
