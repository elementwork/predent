import { and, eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertUser } from "@db/schema";
import { getDb } from "./connection";
import { env } from "../lib/env";
import { insertQueuedNotification } from "../services/notification-service";

type OAuthUserInput = Omit<InsertUser, "provider" | "unionId"> & {
  provider: NonNullable<InsertUser["provider"]>;
  unionId: string;
};

export async function findUserByOAuthIdentity(
  provider: NonNullable<InsertUser["provider"]>,
  unionId: string
) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(
      and(
        eq(schema.users.provider, provider),
        eq(schema.users.unionId, unionId)
      )
    )
    .limit(1);
  return rows.at(0);
}

export async function upsertUser(data: OAuthUserInput) {
  const db = getDb();
  const values = { ...data };
  const updateSet: Partial<InsertUser> = {
    lastSignInAt: new Date(),
    ...data,
  };

  if (
    values.role === undefined &&
    values.provider === "google" &&
    values.unionId &&
    values.unionId === env.ownerUnionId
  ) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  await db.transaction(async tx => {
    const [existing] = await tx
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(
        and(
          eq(schema.users.provider, data.provider),
          eq(schema.users.unionId, data.unionId)
        )
      )
      .limit(1);
    const [user] = await tx
      .insert(schema.users)
      .values(values)
      .onConflictDoUpdate({
        target: [schema.users.provider, schema.users.unionId],
        set: updateSet,
      })
      .returning();

    if (!existing && user) {
      await insertQueuedNotification(tx, {
        userId: user.id,
        type: "system",
        title: "Welcome to PreDent Canada!",
        message:
          "Start exploring PAT Academy, DAT Academy, and the School Hub to kick off your dental school journey.",
        link: "/dashboard",
        idempotencyKey: `welcome:${user.id}`,
      });
    }
  });
}
