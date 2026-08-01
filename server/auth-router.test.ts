import { describe, it, expect } from "vitest";
import { authRouter } from "./auth-router";
import { createTestUser, mockContext } from "./test-helpers";
import { Session } from "@contracts/constants";

function buildCaller(user?: Awaited<ReturnType<typeof createTestUser>>) {
  const ctx = mockContext(user);
  const caller = authRouter.createCaller(ctx);
  return { caller, resHeaders: ctx.resHeaders };
}

describe("authRouter.me", () => {
  it("returns the authenticated user", async () => {
    const user = await createTestUser();
    const { caller } = buildCaller(user);

    const result = await caller.me();

    expect(result.id).toBe(user.id);
    expect(result.email).toBe(user.email);
  });

  it("throws UNAUTHORIZED when no user", async () => {
    const { caller } = buildCaller();

    await expect(caller.me()).rejects.toThrow("Authentication required");
  });
});

describe("authRouter.logout", () => {
  it("sets an expired session cookie", async () => {
    const user = await createTestUser();
    const { caller, resHeaders } = buildCaller(user);

    const result = await caller.logout();
    expect(result.success).toBe(true);

    const setCookie = resHeaders.get("set-cookie");
    expect(setCookie).toBeDefined();
    expect(setCookie).toContain(Session.cookieName);
    expect(setCookie).toContain("Max-Age=0");
  });
});
