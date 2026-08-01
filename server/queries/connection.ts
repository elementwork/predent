import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>> | undefined;
let lastDatabaseUrl: string | undefined;
let client: postgres.Sql | undefined;

function createClient(databaseUrl: string) {
  return postgres(databaseUrl, {
    max_lifetime: 60 * 30, // 30 minutes
    connect_timeout: 10,
    idle_timeout: 20,
  });
}

export function getDb() {
  const databaseUrl = env.databaseUrl;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }
  if (!instance || databaseUrl !== lastDatabaseUrl) {
    if (client) {
      try {
        client.end();
      } catch {
        // ignore cleanup errors
      }
    }
    client = createClient(databaseUrl);
    instance = drizzle(client, {
      schema: fullSchema,
    });
    lastDatabaseUrl = databaseUrl;
  }
  return instance;
}

export async function closeDb() {
  if (client) {
    await client.end();
    client = undefined;
    instance = undefined;
    lastDatabaseUrl = undefined;
  }
}
