import postgres from "postgres";

const databaseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
if (!databaseUrl)
  throw new Error("TEST_DATABASE_URL or DATABASE_URL is required");
const configuredPool = Number(
  process.env.DATABASE_POOL_MAX ?? (process.env.VERCEL === "1" ? 3 : 10)
);
const client = postgres(databaseUrl, { max: 1 });
try {
  const [limits] = await client<
    { maxConnections: number; reservedConnections: number }[]
  >`
    select
      current_setting('max_connections')::int as "maxConnections",
      current_setting('superuser_reserved_connections')::int as "reservedConnections"
  `;
  const [usage] = await client<{ activeConnections: number }[]>`
    select count(*)::int as "activeConnections" from pg_stat_activity
  `;
  const usable = limits.maxConnections - limits.reservedConnections;
  const headroom = usable - usage.activeConnections;
  console.log(
    JSON.stringify({ ...limits, ...usage, configuredPool, headroom }, null, 2)
  );
  if (configuredPool > Math.max(1, Math.floor(usable * 0.1))) {
    throw new Error(
      "Per-instance pool exceeds 10% of usable database connections"
    );
  }
} finally {
  await client.end();
}
