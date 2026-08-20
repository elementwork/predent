import { describe, expect, it } from "vitest";
import {
  categoryPlan,
  difficultyBandFor,
  effectiveQuestionCount,
  fromManipATCategory,
  toManipATCategory,
} from "./categories";

describe("PAT category mapping", () => {
  it("round-trips all product categories", () => {
    const categories = [
      "keyholes",
      "tfe",
      "angle_ranking",
      "hole_punching",
      "cube_counting",
      "pattern_folding",
    ] as const;

    for (const category of categories) {
      expect(fromManipATCategory(toManipATCategory(category))).toBe(category);
    }
  });

  it("builds the canonical 90-question exam order", () => {
    const plan = categoryPlan("exam", 90);
    expect(plan).toHaveLength(90);
    expect(plan.slice(0, 15).every(value => value === "keyholes")).toBe(true);
    expect(plan.slice(15, 30).every(value => value === "tfe")).toBe(true);
    expect(plan.slice(30, 45).every(value => value === "angle_ranking")).toBe(true);
    expect(plan.slice(45, 60).every(value => value === "hole_punching")).toBe(true);
    expect(plan.slice(60, 75).every(value => value === "cube_counting")).toBe(true);
    expect(plan.slice(75).every(value => value === "pattern_folding")).toBe(true);
  });

  it("maps four product levels across five ManipAT bands", () => {
    expect(difficultyBandFor("beginner", 0)).toBe(1);
    expect(difficultyBandFor("beginner", 1)).toBe(2);
    expect(difficultyBandFor("elite", 0)).toBe(4);
    expect(difficultyBandFor("elite", 1)).toBe(5);
  });

  it("enforces fixed quick, timed, and exam counts", () => {
    expect(effectiveQuestionCount("quick", 50)).toBe(10);
    expect(effectiveQuestionCount("timed", 50)).toBe(15);
    expect(effectiveQuestionCount("exam", 5)).toBe(90);
  });
});
