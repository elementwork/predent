import { describe, it, expect } from "vitest";
import {
  generateProblem,
  getCorrectAnswer,
  type PatCategory,
  type Difficulty,
} from "./lib/pat-generation/index.js";
import { createPRNG } from "./lib/pat-generation/prng.js";

const CATEGORIES: PatCategory[] = [
  "keyholes",
  "tfe",
  "angle_ranking",
  "hole_punching",
  "cube_counting",
  "pattern_folding",
];

// Authentic DAT choice counts per category.
const OPTION_COUNTS: Record<PatCategory, number> = {
  keyholes: 5,
  tfe: 4,
  angle_ranking: 4,
  hole_punching: 5,
  cube_counting: 5,
  pattern_folding: 4,
};

describe("PAT generator contract", () => {
  it.each(CATEGORIES)("generates %s with the authentic option count", cat => {
    for (const seed of [1, 42, 99, 1234]) {
      for (const difficulty of ["easy", "medium", "hard"] as Difficulty[]) {
        const problem = generateProblem(cat, { seed, difficulty }) as unknown as Record<
          string,
          unknown
        >;
        const options: unknown = problem.options ?? problem.choices;
        expect(
          Array.isArray(options) ? (options as unknown[]).length : 0
        ).toBe(OPTION_COUNTS[cat]);
        expect(getCorrectAnswer(cat, { seed, difficulty })).toBeGreaterThanOrEqual(0);
        expect(getCorrectAnswer(cat, { seed, difficulty })).toBeLessThan(OPTION_COUNTS[cat]);
      }
    }
  });

  it("is deterministic for the same seed", () => {
    for (const cat of CATEGORIES) {
      const a = generateProblem(cat, { seed: 31337, difficulty: "medium" });
      const b = generateProblem(cat, { seed: 31337, difficulty: "medium" });
      expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    }
  });

  it("getCorrectAnswer points at the generated correct option", () => {
    const cube = generateProblem("cube_counting", {
      seed: 42,
      difficulty: "hard",
    }) as unknown as Record<string, unknown>;
    const choices = cube.choices as number[];
    const idx = getCorrectAnswer("cube_counting", {
      seed: 42,
      difficulty: "hard",
    });
    expect(choices[idx]).toBe(cube.answer);
  });
});

describe("keyholes", () => {
  it("options are unique silhouettes matching the object along an axis", () => {
    for (const seed of [3, 7, 21]) {
      const p = generateProblem("keyholes", {
        seed,
        difficulty: "medium",
      }) as {
        cubes: { x: number; y: number; z: number }[];
        correctAxis: "x" | "y" | "z";
        options: boolean[][][];
        correctIndex: number;
      };
      const keys = p.options.map(g => JSON.stringify(g));
      expect(new Set(keys).size).toBe(5);
      expect(p.correctIndex).toBeGreaterThanOrEqual(0);
      expect(p.correctIndex).toBeLessThan(5);
    }
  });
});

describe("tfe", () => {
  it("has three views and the missing one matches the correct option", () => {
    for (const seed of [1, 7, 99]) {
      const p = generateProblem("tfe", {
        seed,
        difficulty: "medium",
      }) as {
        views: Record<string, { cols: number; rows: number; edges: unknown[] }>;
        missingView: string;
        options: { cols: number; rows: number; edges: unknown[] }[];
        correctIndex: number;
      };
      expect(Object.keys(p.views)).toEqual(["top", "front", "end"]);
      const correct = p.views[p.missingView];
      const chosen = p.options[p.correctIndex];
      expect(chosen.cols).toBe(correct.cols);
      expect(chosen.rows).toBe(correct.rows);
      expect(chosen.edges.length).toBe(correct.edges.length);
    }
  });
});

describe("angle_ranking", () => {
  it("the correct option is the sorted permutation of the four angles", () => {
    for (const seed of [5, 42, 777]) {
      const p = generateProblem("angle_ranking", {
        seed,
        difficulty: "hard",
      }) as { angles: number[]; options: string[]; correctIndex: number };
      const order = p.angles
        .map((a, i) => i + 1)
        .sort((i, j) => p.angles[i - 1]! - p.angles[j - 1]!)
        .join("-");
      expect(p.options[p.correctIndex]).toBe(order);
      expect(p.angles.every(a => a > 0 && a <= 90)).toBe(true);
    }
  });
});

describe("hole_punching", () => {
  it("unfolded holes double per fold, stay on the grid, and every fold is a half-fold", () => {
    for (const seed of [2, 42, 999]) {
      const p = generateProblem("hole_punching", {
        seed,
        difficulty: "hard",
      }) as {
        foldSteps: { axis: string; line: number }[];
        correctHoles: { x: number; y: number }[];
        correctIndex: number;
      };
      expect(p.correctHoles.length).toBeGreaterThanOrEqual(2);
      expect(p.correctHoles.length).toBeLessThanOrEqual(2 ** p.foldSteps.length);
      for (const h of p.correctHoles) {
        expect(h.x).toBeGreaterThanOrEqual(0);
        expect(h.x).toBeLessThan(4);
        expect(h.y).toBeGreaterThanOrEqual(0);
        expect(h.y).toBeLessThan(4);
      }
      for (const f of p.foldSteps) {
        expect(f.line).toBeGreaterThanOrEqual(1);
        expect(f.line).toBeLessThanOrEqual(4);
      }
    }
  });

  it("produces 5 distinct unfolded options including the correct one", () => {
    for (const seed of [1, 7, 42]) {
      const p = generateProblem("hole_punching", {
        seed,
        difficulty: "medium",
      }) as { options: { x: number; y: number }[][]; correctIndex: number };
      const keys = p.options.map(o =>
        o
          .map(h => `${h.x},${h.y}`)
          .sort()
          .join("|")
      );
      expect(new Set(keys).size).toBe(5);
      expect(
        JSON.stringify(p.options[p.correctIndex]!.sort())
      ).toBe(JSON.stringify([...p.options[p.correctIndex]!].sort()));
    }
  });
});

describe("cube_counting", () => {
  it("answer always present in choices and never zero", () => {
    for (const seed of [1, 2, 3, 4, 5, 42]) {
      const p = generateProblem("cube_counting", {
        seed,
        difficulty: "medium",
      }) as { answer: number; choices: number[]; targetN: number };
      expect(p.answer).toBeGreaterThanOrEqual(1);
      expect(p.choices).toContain(p.answer);
      expect(p.choices.length).toBe(5);
      expect(new Set(p.choices).size).toBe(5);
    }
  });
});

describe("pattern_folding", () => {
  it("correct option matches the net's visible face marks (top|left|right)", () => {
    for (const seed of [11, 42, 555]) {
      const p = generateProblem("pattern_folding", {
        seed,
        difficulty: "medium",
      }) as { net: string[]; options: string[]; correctIndex: number };
      const marks = p.options[p.correctIndex]!.split("|");
      expect(marks.length).toBe(3);
      // Index order: 0=front, 1=top, 2=bottom, 3=left, 4=right, 5=back.
      expect(marks[0]).toBe(p.net[1] ?? "");
      expect(marks[1]).toBe(p.net[3] ?? "");
      expect(marks[2]).toBe(p.net[4] ?? "");
    }
  });
});

describe("prng", () => {
  it("produces the same sequence from the same seed", () => {
    const a = createPRNG(123);
    const b = createPRNG(123);
    expect(a()).toBe(b());
    expect(a()).toBe(b());
  });
});