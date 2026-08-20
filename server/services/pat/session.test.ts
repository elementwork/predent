import { describe, expect, it } from "vitest";
import { sessionTimeLimitSeconds } from "./session";

describe("PAT session timing", () => {
  it("keeps exam timing immutable even when a client disables time limits", () => {
    expect(sessionTimeLimitSeconds("exam", 90, false)).toBe(3600);
    expect(sessionTimeLimitSeconds("exam", 90, true)).toBe(3600);
  });

  it("keeps pausable practice timing optional", () => {
    expect(sessionTimeLimitSeconds("timed", 15, true)).toBe(900);
    expect(sessionTimeLimitSeconds("category", 3, true)).toBe(120);
    expect(sessionTimeLimitSeconds("category", 3, false)).toBeNull();
  });
});
