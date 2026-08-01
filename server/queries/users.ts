import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertUser } from "@db/schema";
import { getDb } from "./connection";
import { env } from "../lib/env";
import { createNotification } from "../lib/email";

export async function findUserByUnionId(unionId: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.unionId, unionId))
    .limit(1);
  return rows.at(0);
}

export async function upsertUser(data: InsertUser) {
  const db = getDb();
  const existing = await findUserByUnionId(data.unionId);
  const values = { ...data };
  const updateSet: Partial<InsertUser> = {
    lastSignInAt: new Date(),
    ...data,
  };

  if (
    values.role === undefined &&
    values.unionId &&
    values.unionId === env.ownerUnionId
  ) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  await db.insert(schema.users).values(values).onConflictDoUpdate({
    target: schema.users.unionId,
    set: updateSet,
  });

  // Send welcome notification for brand-new users
  if (!existing) {
    const [newUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.unionId, data.unionId))
      .limit(1);

    if (newUser) {
      await createNotification({
        userId: newUser.id,
        type: "system",
        title: "Welcome to PreDent Canada!",
        message:
          "Start exploring PAT Academy, DAT Academy, and the School Hub to kick off your dental school journey.",
        link: "/dashboard",
      });
    }
  }
}
