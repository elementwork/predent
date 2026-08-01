import { describe, it, expect } from "vitest";
import { toolsRouter } from "./tools-router";

const createCaller = () =>
  toolsRouter.createCaller({
    req: new Request("http://localhost"),
    resHeaders: new Headers(),
  });

describe("toolsRouter.calculateCompetitiveness", () => {
  it("returns sorted results for a strong Ontario applicant", async () => {
    const caller = createCaller();
    const result = await caller.calculateCompetitiveness({
      gpa: 3.96,
      gpaScale: "4.0",
      datAa: 24,
      datPat: 23,
      datRc: 22,
      province: "Ontario",
      degreeStatus: "completed",
      casperQuartile: 4,
      extracurricularScore: 8,
    });

    expect(result.results.length).toBeGreaterThan(0);

    const top = result.results[0];
    expect(top).toHaveProperty("schoolId");
    expect(top).toHaveProperty("schoolName");
    expect(top).toHaveProperty("probability");
    expect(top).toHaveProperty("rating");
    expect(top).toHaveProperty("isIp");
    expect(top).toHaveProperty("breakdown");

    // Higher probability should be first
    for (let i = 1; i < result.results.length; i++) {
      expect(result.results[i - 1].probability).toBeGreaterThanOrEqual(
        result.results[i].probability
      );
    }
  });

  it("gives in-province schools higher probability than out-of-province", async () => {
    const caller = createCaller();
    const bcResult = await caller.calculateCompetitiveness({
      gpa: 3.7,
      gpaScale: "4.0",
      datAa: 21,
      datPat: 20,
      datRc: 21,
      province: "British Columbia",
      degreeStatus: "in_progress",
      casperQuartile: 3,
      extracurricularScore: 5,
    });

    const ubc = bcResult.results.find(r => r.schoolId === "ubc");
    const uoft = bcResult.results.find(r => r.schoolId === "uoft");

    expect(ubc).toBeDefined();
    expect(uoft).toBeDefined();
    expect(ubc!.isIp).toBe(true);
    expect(uoft!.isIp).toBe(false);
    expect(ubc!.probability).toBeGreaterThan(uoft!.probability);
  });

  it("normalizes 100-scale GPA to 4.0 scale", async () => {
    const caller = createCaller();
    const result = await caller.calculateCompetitiveness({
      gpa: 80,
      gpaScale: "100",
      datAa: 20,
      datPat: 20,
      datRc: 20,
      province: "Quebec",
      degreeStatus: "in_progress",
      casperQuartile: 0,
      extracurricularScore: 5,
    });

    const mcgill = result.results.find(r => r.schoolId === "mcgill");
    expect(mcgill).toBeDefined();
    expect(mcgill!.breakdown.gpa.your).toBeCloseTo(3.2, 1);
  });
});
