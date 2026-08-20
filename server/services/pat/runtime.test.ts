import { describe, expect, it } from "vitest";
import {
  sanitizePatExplanationHtml,
  sanitizePatSolution,
  type PatSolutionPayload,
} from "./runtime";

const solution: PatSolutionPayload = {
  correctChoiceIndex: 2,
  answerDisplay: "C",
  explanationHtml:
    "<p>Compare the views.</p><h4>Facts</h4><ul><li><strong>A</strong>: mismatch</li></ul>",
};

describe("PAT explanation HTML boundary", () => {
  it("accepts the exact structural tags emitted by ManipAT", () => {
    expect(sanitizePatExplanationHtml(solution.explanationHtml)).toBe(
      solution.explanationHtml
    );
    expect(sanitizePatSolution(solution)).toEqual(solution);
  });

  it.each([
    "<script>alert(1)</script>",
    '<p onclick="alert(1)">bad</p>',
    '<img src="x" onerror="alert(1)">',
    "<svg><script>alert(1)</script></svg>",
    "<p>broken < markup</p>",
  ])("rejects markup outside the strict allowlist: %s", html => {
    expect(() => sanitizePatExplanationHtml(html)).toThrow();
  });
});
