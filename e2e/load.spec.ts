import { expect, test } from "@playwright/test";

test("ping endpoint meets the baseline capacity budget", async ({
  request,
}) => {
  const durations: number[] = [];
  const responses = await Promise.all(
    Array.from({ length: 100 }, async () => {
      const started = performance.now();
      const response = await request.get("/api/trpc/ping");
      durations.push(performance.now() - started);
      return response;
    })
  );
  durations.sort((a, b) => a - b);
  const p95 = durations[Math.ceil(durations.length * 0.95) - 1];
  expect(responses.every(response => response.ok())).toBe(true);
  expect(p95).toBeLessThan(1_500);
});
