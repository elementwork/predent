import { describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { users } from "@db/schema";
import { getDb } from "./connection";
import { findUserByOAuthIdentity, upsertUser } from "./users";
import { hasDb } from "../test-db-flag";

describe.skipIf(!hasDb)("OAuth user identity", () => {
  it("keeps identical provider subjects in separate accounts", async () => {
    const unionId = `cross-provider-${crypto.randomUUID()}`;

    await upsertUser({ provider: "google", unionId, name: "Google User" });
    await upsertUser({ provider: "discord", unionId, name: "Discord User" });

    const google = await findUserByOAuthIdentity("google", unionId);
    const discord = await findUserByOAuthIdentity("discord", unionId);

    expect(google?.id).toBeDefined();
    expect(discord?.id).toBeDefined();
    expect(google?.id).not.toBe(discord?.id);
    expect(google?.name).toBe("Google User");
    expect(discord?.name).toBe("Discord User");

    await getDb().delete(users).where(eq(users.unionId, unionId));
  });
});
