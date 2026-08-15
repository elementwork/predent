import postgres from "postgres";

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl) throw new Error("TEST_DATABASE_URL is required");

const sql = postgres(databaseUrl, { max: 1 });
const prefix = `plan-${crypto.randomUUID()}`;

async function expectIndex(
  label: string,
  indexName: string,
  query: ReturnType<typeof sql>
) {
  const result = await query;
  const plan = JSON.stringify(result);
  if (!plan.includes(indexName)) {
    throw new Error(`${label} did not use ${indexName}: ${plan}`);
  }
  console.log(`[query-plan] ${label}: ${indexName}`);
}

try {
  const inserted = await sql`
    INSERT INTO users (provider, "unionId", name)
    SELECT 'google', ${prefix} || '-' || n, 'Plan fixture'
    FROM generate_series(1, 40) n
    RETURNING id
  `;
  const userIds = inserted.map(row => Number(row.id));

  for (const userId of userIds) {
    await sql`
      INSERT INTO pat_attempts
        (user_id, category, difficulty, question_id, is_correct, time_spent, created_at)
      SELECT ${userId},
        CASE WHEN n % 2 = 0 THEN 'keyholes' ELSE 'tfe' END,
        'beginner', n::text, n % 3 = 0, n % 60, now() - n * interval '1 minute'
      FROM generate_series(1, 500) n
    `;
    await sql`
      INSERT INTO notifications
        (user_id, type, title, message, read, created_at)
      SELECT ${userId}, 'system', 'Fixture', 'Fixture', n % 2 = 0,
        now() - n * interval '1 minute'
      FROM generate_series(1, 500) n
    `;
    await sql`
      INSERT INTO tasks
        (user_id, title, category, status, priority, due_date, created_at, updated_at)
      SELECT ${userId}, 'Fixture', 'academic',
        CASE WHEN n % 2 = 0 THEN 'in_progress' ELSE 'not_started' END,
        'medium', now() + n * interval '1 hour', now(), now()
      FROM generate_series(1, 500) n
    `;
  }

  await sql`ANALYZE pat_attempts`;
  await sql`ANALYZE notifications`;
  await sql`ANALYZE tasks`;
  const userId = userIds[0]!;

  await expectIndex(
    "PAT category history",
    "pat_attempts_user_category_created_idx",
    sql`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
      SELECT * FROM pat_attempts
      WHERE user_id = ${userId} AND category = 'keyholes'
      ORDER BY created_at DESC LIMIT 50`
  );
  await expectIndex(
    "unread notifications",
    "notifications_user_read_created_idx",
    sql`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
      SELECT * FROM notifications
      WHERE user_id = ${userId} AND read = false
      ORDER BY created_at DESC LIMIT 50`
  );
  await expectIndex(
    "planner due tasks",
    "tasks_user_status_due_idx",
    sql`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
      SELECT * FROM tasks
      WHERE user_id = ${userId} AND status = 'in_progress'
      ORDER BY due_date LIMIT 50`
  );
} finally {
  await sql`DELETE FROM users WHERE "unionId" LIKE ${`${prefix}%`}`;
  await sql.end();
}
