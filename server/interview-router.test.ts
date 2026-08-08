import { describe, it, expect, beforeAll } from "vitest";
import { interviewRouter } from "./interview-router";
import { getDb } from "./queries/connection";
import { interviewQuestions } from "@db/schema";
import type { User } from "@db/schema";
import { hasDb } from "./test-db-flag";
import { mockContext } from "./test-helpers";

const seedQuestions = [
  {
    publicId: "test-mmi-1",
    format: "MMI" as const,
    category: "Ethical Scenario",
    question: "Test MMI question 1",
    frequency: 90,
  },
  {
    publicId: "test-mmi-2",
    format: "MMI" as const,
    category: "Communication",
    question: "Test MMI question 2",
    frequency: 80,
  },
  {
    publicId: "test-panel-1",
    format: "Panel" as const,
    category: "Motivation for Dentistry",
    question: "Test Panel question 1",
    frequency: 95,
  },
  {
    publicId: "test-panel-2",
    format: "Panel" as const,
    category: "Knowledge of Profession",
    question: "Test Panel question 2",
    frequency: 75,
  },
];

beforeAll(async () => {
  const db = getDb();
  // Clear existing test questions
  await db.delete(interviewQuestions);
  // Insert test questions
  for (const q of seedQuestions) {
    await db.insert(interviewQuestions).values(q);
  }
});

const premiumUser = {
  id: 9999,
  role: "user",
  tier: "premium",
  premiumUntil: new Date("2099-01-01T00:00:00.000Z"),
} as User;

const createCaller = (authenticated = true) =>
  interviewRouter.createCaller(
    mockContext(authenticated ? premiumUser : undefined)
  );

describe.skipIf(!hasDb)("interviewRouter.getQuestions", () => {
  it("returns MMI questions when format is MMI", async () => {
    const caller = createCaller();
    const questions = await caller.getQuestions({ format: "MMI" });

    expect(questions.length).toBeGreaterThan(0);
    expect(questions.every(q => q.format === "MMI")).toBe(true);
  });

  it("returns Panel questions when format is Panel", async () => {
    const caller = createCaller();
    const questions = await caller.getQuestions({ format: "Panel" });

    expect(questions.length).toBeGreaterThan(0);
    expect(questions.every(q => q.format === "Panel")).toBe(true);
  });

  it("returns all questions when no filter is provided", async () => {
    const caller = createCaller();
    const questions = await caller.getQuestions({});

    expect(questions.length).toBeGreaterThan(0);
  });

  it("filters by category", async () => {
    const caller = createCaller();
    const questions = await caller.getQuestions({
      format: "Panel",
      category: "Motivation for Dentistry",
    });

    expect(questions.length).toBeGreaterThan(0);
    expect(
      questions.every(q => q.category === "Motivation for Dentistry")
    ).toBe(true);
  });
});

describe.skipIf(!hasDb)("interviewRouter.getCategories", () => {
  it("returns categories for MMI", async () => {
    const caller = createCaller(false);
    const categories = await caller.getCategories({ format: "MMI" });

    expect(categories.length).toBeGreaterThan(0);
    expect(categories).toContain("Ethical Scenario");
  });

  it("returns categories for Panel", async () => {
    const caller = createCaller(false);
    const categories = await caller.getCategories({ format: "Panel" });

    expect(categories.length).toBeGreaterThan(0);
    expect(categories).toContain("Motivation for Dentistry");
  });
});

describe.skipIf(!hasDb)("interviewRouter.getRandomSet", () => {
  it("returns the requested number of MMI questions", async () => {
    const caller = createCaller();
    const set = await caller.getRandomSet({ format: "MMI", count: 2 });

    expect(set.length).toBe(2);
    expect(set.every(q => q.format === "MMI")).toBe(true);
  });

  it("does not return more questions than available", async () => {
    const caller = createCaller();
    const set = await caller.getRandomSet({ format: "Panel", count: 20 });

    expect(set.length).toBeLessThanOrEqual(20);
    expect(set.every(q => q.format === "Panel")).toBe(true);
  });
});
