import { describe, it, expect } from "vitest";
import { profileRouter } from "./profile-router";
import { createTestUser, mockContext, seedProfile } from "./test-helpers";

const createCaller = (user?: Awaited<ReturnType<typeof createTestUser>>) =>
  profileRouter.createCaller(mockContext(user));

describe("profileRouter.get", () => {
  it("returns null when profile does not exist", async () => {
    const user = await createTestUser();
    const caller = createCaller(user);

    const result = await caller.get();
    expect(result).toBeNull();
  });

  it("returns the user's profile", async () => {
    const user = await createTestUser();
    const caller = createCaller(user);
    await seedProfile(user.id, { province: "British Columbia" });

    const result = await caller.get();
    expect(result).not.toBeNull();
    expect(result?.province).toBe("British Columbia");
  });

  it("throws UNAUTHORIZED when no user", async () => {
    const caller = createCaller();
    await expect(caller.get()).rejects.toThrow("Authentication required");
  });
});

describe("profileRouter.upsert", () => {
  it("creates a new profile", async () => {
    const user = await createTestUser();
    const caller = createCaller(user);

    const result = await caller.upsert({
      firstName: "Jane",
      lastName: "Doe",
      province: "Alberta",
    });

    expect(result.success).toBe(true);
    expect(result.action).toBe("created");

    const profile = await caller.get();
    expect(profile?.firstName).toBe("Jane");
    expect(profile?.province).toBe("Alberta");
  });

  it("updates an existing profile", async () => {
    const user = await createTestUser();
    const caller = createCaller(user);
    await seedProfile(user.id, { firstName: "Old" });

    const result = await caller.upsert({ firstName: "New" });

    expect(result.success).toBe(true);
    expect(result.action).toBe("updated");

    const profile = await caller.get();
    expect(profile?.firstName).toBe("New");
  });

  it("updates only provided fields (partial update)", async () => {
    const user = await createTestUser();
    const caller = createCaller(user);
    await seedProfile(user.id, { firstName: "Jane", lastName: "Doe", province: "Ontario" });

    await caller.upsert({ firstName: "John" });

    const profile = await caller.get();
    expect(profile?.firstName).toBe("John");
    expect(profile?.lastName).toBe("Doe");
    expect(profile?.province).toBe("Ontario");
  });
});
