const target =
  process.env.LOAD_TEST_URL ?? "http://127.0.0.1:3000/api/trpc/ping";
const requests = Number(process.env.LOAD_TEST_REQUESTS ?? 200);
const concurrency = Number(process.env.LOAD_TEST_CONCURRENCY ?? 20);
const maximumP95 = Number(process.env.LOAD_TEST_MAX_P95_MS ?? 1500);
const maximumErrorRate = Number(process.env.LOAD_TEST_MAX_ERROR_RATE ?? 0.01);

if (
  ![requests, concurrency, maximumP95, maximumErrorRate].every(Number.isFinite)
) {
  throw new Error("Load-test configuration must be numeric");
}

const durations = [];
let failures = 0;
let cursor = 0;
await Promise.all(
  Array.from({ length: Math.min(concurrency, requests) }, async () => {
    while (cursor < requests) {
      cursor++;
      const started = performance.now();
      try {
        const response = await fetch(target, {
          headers: { "user-agent": "predent-capacity-gate/1.0" },
          signal: AbortSignal.timeout(10_000),
        });
        if (!response.ok) failures++;
        await response.arrayBuffer();
      } catch {
        failures++;
      } finally {
        durations.push(performance.now() - started);
      }
    }
  })
);

durations.sort((a, b) => a - b);
const percentile = value =>
  durations[
    Math.min(durations.length - 1, Math.ceil(durations.length * value) - 1)
  ] ?? 0;
const result = {
  target,
  requests,
  concurrency,
  errorRate: failures / requests,
  p50Ms: Math.round(percentile(0.5)),
  p95Ms: Math.round(percentile(0.95)),
  p99Ms: Math.round(percentile(0.99)),
};
console.log(JSON.stringify(result, null, 2));
if (result.errorRate > maximumErrorRate || result.p95Ms > maximumP95)
  process.exitCode = 1;
